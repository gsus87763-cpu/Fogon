const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const { verificarIdTokenGoogle } = require('../utils/googleAuth');
const {
  enviarCorreoRecuperacion, enviarCorreoNuevaSolicitudEmpleado
} = require('../utils/mailer');
const { generarCaptcha, verificarCaptcha } = require('../utils/captcha');
const empleadoModel = require('../models/empleadoModel');

const SALT_ROUNDS = 12;
const RECUPERACION_TTL_MS = 60 * 60 * 1000; // 1 hora

// GET /api/auth/captcha -> { captchaId, svg }
function obtenerCaptcha(req, res) {
  res.json(generarCaptcha());
}

// El rol de un empleado se deduce, en este orden:
//  1) está en `administrador` -> 'admin'
//  2) está en `cocinero` -> 'cocina'
//  3) es responsable de un área (area.id_responsable) -> se mapea el nombre
//     del área a un rol (Salón->salon, Almacén->almacen, Atención al
//     Cliente->caja, Recursos Humanos->rrhh)
//  4) si nada de eso aplica -> 'staff' (acceso mínimo)
async function obtenerRolEmpleado(conexion, idEmpleado) {
  const [admin] = await conexion.query('SELECT 1 FROM administrador WHERE id_empleado = ?', [idEmpleado]);
  if (admin.length > 0) return 'admin';
  const [cocinero] = await conexion.query('SELECT 1 FROM cocinero WHERE id_empleado = ?', [idEmpleado]);
  if (cocinero.length > 0) return 'cocina';

  // Rol asignado directamente al aprobar la solicitud (ver empleadoModel.aprobar).
  // Se revisa antes que el área, porque el modelo de "responsable de área" solo
  // admite una persona por área y no alcanza para varios agentes/cajeros.
  const [[fila]] = await conexion.query('SELECT rol_manual FROM empleado WHERE id_empleado = ?', [idEmpleado]);
  if (fila?.rol_manual) return fila.rol_manual;

  const [areas] = await conexion.query('SELECT nombre FROM area WHERE id_responsable = ?', [idEmpleado]);
  for (const { nombre } of areas) {
    if (/almac[eé]n/i.test(nombre)) return 'almacen';
    if (/sal[oó]n/i.test(nombre)) return 'salon';
    if (/caja/i.test(nombre) || /atenci[oó]n al cliente/i.test(nombre)) return 'caja';
    if (/recursos humanos/i.test(nombre)) return 'rrhh';
  }
  return 'staff';
}

function firmarToken({ tipoCuenta, id, nombre, correo, rol }) {
  const payload = { tipo_cuenta: tipoCuenta, id_cuenta: id, rol, nombre, correo };
  // Compatibilidad con el resto del backend, que lee req.user.rol
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  });
  return { token, payload };
}

async function registrarLogAcceso({ idEmpleado, estado, req }) {
  if (!idEmpleado) return; // el log_acceso del dump solo soporta empleados
  try {
    await pool.query(
      'INSERT INTO log_acceso (fecha, estado, ip, tipo_acceso, id_empleado) VALUES (CURDATE(), ?, ?, ?, ?)',
      [estado, req.ip, 'WEB', idEmpleado]
    );
  } catch (err) {
    console.error('No se pudo registrar el log de acceso:', err.message);
  }
}

// POST /api/auth/registro  (siempre crea un CLIENTE; el personal se crea por el admin)
async function registro(req, res) {
  const { nombre, apellidos, ci, telefono, correo, password, captchaId, captchaRespuesta } = req.body;
  if (!nombre || !apellidos || !correo || !password) {
    return res.status(400).json({ mensaje: 'nombre, apellidos, correo y password son obligatorios' });
  }
  if (!captchaId || !captchaRespuesta) {
    return res.status(400).json({ mensaje: 'Completa el captcha' });
  }
  if (!verificarCaptcha(captchaId, captchaRespuesta)) {
    return res.status(400).json({ mensaje: 'El captcha es incorrecto o expiró, intenta de nuevo' });
  }
  try {
    const [existente] = await pool.query('SELECT id_cliente FROM cliente WHERE correo = ?', [correo]);
    if (existente.length > 0) return res.status(409).json({ mensaje: 'Ya existe una cuenta con ese correo' });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const [resultado] = await pool.query(
      'INSERT INTO cliente (nombre, apellidos, ci, telefono, correo, contrasenia) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, apellidos, ci || null, telefono || null, correo, hash]
    );

    const { token, payload } = firmarToken({
      tipoCuenta: 'CLIENTE', id: resultado.insertId, nombre, correo, rol: 'cliente'
    });
    res.status(201).json({ token, usuario: payload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al registrar la cuenta' });
  }
}

// POST /api/auth/registro-empleado
// Cualquiera puede postular a trabajar en El Fogón, pero la cuenta queda
// "Pendiente" y no puede iniciar sesión hasta que un administrador la
// apruebe (ver empleadoController.aprobar).
async function registroEmpleado(req, res) {
  const { nombre, apellidos, ci, telefono, correo, password, captchaId, captchaRespuesta } = req.body;
  if (!nombre || !apellidos || !correo || !password) {
    return res.status(400).json({ mensaje: 'nombre, apellidos, correo y password son obligatorios' });
  }
  if (!captchaId || !captchaRespuesta) {
    return res.status(400).json({ mensaje: 'Completa el captcha' });
  }
  if (!verificarCaptcha(captchaId, captchaRespuesta)) {
    return res.status(400).json({ mensaje: 'El captcha es incorrecto o expiró, intenta de nuevo' });
  }
  try {
    const yaExiste = await empleadoModel.existePorCorreoOCi(correo, ci);
    if (yaExiste) {
      return res.status(409).json({ mensaje: 'Ya existe una cuenta de personal con ese correo o CI' });
    }
    const [clienteExistente] = await pool.query('SELECT id_cliente FROM cliente WHERE correo = ?', [correo]);
    if (clienteExistente.length > 0) {
      return res.status(409).json({ mensaje: 'Ese correo ya está registrado como cliente' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const empleado = await empleadoModel.crearSolicitud({ nombre, apellidos, ci, telefono, correo, hash });

    if (process.env.ADMIN_NOTIFICACION_CORREO) {
      enviarCorreoNuevaSolicitudEmpleado({
        correoAdmin: process.env.ADMIN_NOTIFICACION_CORREO,
        nombreSolicitante: `${nombre} ${apellidos}`
      }).catch((err) => console.error('No se pudo notificar la nueva solicitud de personal:', err.message));
    }

    res.status(201).json({
      mensaje: 'Registro enviado. Un administrador revisará tu solicitud antes de que puedas ingresar.',
      id_empleado: empleado.id_empleado,
      estado: empleado.estado
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al registrar la solicitud de personal' });
  }
}

// POST /api/auth/login  { correo, password }
// Busca primero en empleado (personal interno) y luego en cliente.
async function login(req, res) {
  const { correo, password, captchaId, captchaRespuesta } = req.body;
  if (!correo || !password) return res.status(400).json({ mensaje: 'correo y password son obligatorios' });
  if (!captchaId || !captchaRespuesta) {
    return res.status(400).json({ mensaje: 'Completa el captcha' });
  }
  if (!verificarCaptcha(captchaId, captchaRespuesta)) {
    return res.status(400).json({ mensaje: 'El captcha es incorrecto o expiró, intenta de nuevo' });
  }

  try {
    const [empleados] = await pool.query(
      'SELECT id_empleado, nombre, apellidos, contrasenia, estado, motivo_rechazo FROM empleado WHERE correo_electronico = ?',
      [correo]
    );

    if (empleados.length > 0) {
      const empleado = empleados[0];
      const ok = empleado.contrasenia && await bcrypt.compare(password, empleado.contrasenia);
      if (!ok) {
        await registrarLogAcceso({ idEmpleado: empleado.id_empleado, estado: 'FALLIDO', req });
        return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
      }
      if (empleado.estado === 'Pendiente') {
        return res.json({ estadoSolicitud: 'PENDIENTE' });
      }
      if (empleado.estado === 'Rechazado') {
        return res.json({ estadoSolicitud: 'RECHAZADO', motivo: empleado.motivo_rechazo || null });
      }
      if (empleado.estado === 'Inactivo') {
        return res.status(403).json({ mensaje: 'Cuenta inactiva, contacte al administrador' });
      }
      const rol = await obtenerRolEmpleado(pool, empleado.id_empleado);
      const { token, payload } = firmarToken({
        tipoCuenta: 'EMPLEADO', id: empleado.id_empleado,
        nombre: `${empleado.nombre} ${empleado.apellidos}`, correo, rol
      });
      await registrarLogAcceso({ idEmpleado: empleado.id_empleado, estado: 'EXITOSO', req });
      return res.json({ token, usuario: payload });
    }

    const [clientes] = await pool.query(
      'SELECT id_cliente, nombre, apellidos, contrasenia, activo FROM cliente WHERE correo = ?',
      [correo]
    );
    if (clientes.length === 0) return res.status(401).json({ mensaje: 'Credenciales incorrectas' });

    const cliente = clientes[0];
    if (!cliente.activo) return res.status(403).json({ mensaje: 'Cuenta inactiva' });
    const ok = cliente.contrasenia && await bcrypt.compare(password, cliente.contrasenia);
    if (!ok) return res.status(401).json({ mensaje: 'Credenciales incorrectas' });

    const { token, payload } = firmarToken({
      tipoCuenta: 'CLIENTE', id: cliente.id_cliente,
      nombre: `${cliente.nombre} ${cliente.apellidos}`, correo, rol: 'cliente'
    });
    res.json({ token, usuario: payload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al iniciar sesión' });
  }
}

function logout(req, res) {
  res.json({ mensaje: 'Sesión cerrada' });
}

// POST /api/auth/google  { idToken } — solo para clientes (vincula/crea CLIENTE)
async function loginGoogle(req, res) {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ mensaje: 'Falta el token de Google' });

  try {
    const datos = await verificarIdTokenGoogle(idToken);
    if (!datos.correoVerificado) {
      return res.status(401).json({ mensaje: 'Tu cuenta de Google no tiene el correo verificado' });
    }

    const [existentes] = await pool.query(
      'SELECT id_cliente, nombre, apellidos, activo, google_id FROM cliente WHERE correo = ? OR google_id = ?',
      [datos.correo, datos.googleId]
    );

    let cliente;
    if (existentes.length > 0) {
      cliente = existentes[0];
      if (!cliente.activo) return res.status(403).json({ mensaje: 'Cuenta inactiva, contacte al administrador' });
      if (!cliente.google_id) {
        await pool.query("UPDATE cliente SET google_id = ?, proveedor = 'GOOGLE' WHERE id_cliente = ?", [datos.googleId, cliente.id_cliente]);
      }
    } else {
      const [resultado] = await pool.query(
        "INSERT INTO cliente (nombre, apellidos, correo, google_id, proveedor) VALUES (?, ?, ?, ?, 'GOOGLE')",
        [datos.nombre, datos.apellidos || '-', datos.correo, datos.googleId]
      );
      cliente = { id_cliente: resultado.insertId, nombre: datos.nombre, apellidos: datos.apellidos || '' };
    }

    const { token, payload } = firmarToken({
      tipoCuenta: 'CLIENTE', id: cliente.id_cliente,
      nombre: `${cliente.nombre} ${cliente.apellidos}`.trim(), correo: datos.correo, rol: 'cliente'
    });
    res.json({ token, usuario: payload });
  } catch (err) {
    console.error(err);
    res.status(401).json({ mensaje: 'No se pudo validar tu cuenta de Google' });
  }
}

// POST /api/auth/recuperar  { correo }
// Responde igual exista o no la cuenta (para no filtrar qué correos existen).
async function solicitarRecuperacion(req, res) {
  const { correo } = req.body;
  const mensajeGenerico = { mensaje: 'Si el correo está registrado, te enviamos instrucciones para recuperar tu contraseña.' };
  if (!correo) return res.status(400).json({ mensaje: 'El correo es obligatorio' });

  try {
    const [empleados] = await pool.query('SELECT id_empleado, nombre FROM empleado WHERE correo_electronico = ?', [correo]);
    const [clientes] = await pool.query('SELECT id_cliente, nombre FROM cliente WHERE correo = ? AND activo = 1', [correo]);

    let tipoCuenta = null, idCuenta = null, nombre = null;
    if (empleados.length > 0) { tipoCuenta = 'EMPLEADO'; idCuenta = empleados[0].id_empleado; nombre = empleados[0].nombre; }
    else if (clientes.length > 0) { tipoCuenta = 'CLIENTE'; idCuenta = clientes[0].id_cliente; nombre = clientes[0].nombre; }

    if (tipoCuenta) {
      const tokenPlano = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(tokenPlano).digest('hex');
      const expiracion = new Date(Date.now() + RECUPERACION_TTL_MS);

      await pool.query(
        'INSERT INTO recuperacion_password (tipo_cuenta, id_cuenta, token_hash, fecha_expiracion) VALUES (?, ?, ?, ?)',
        [tipoCuenta, idCuenta, tokenHash, expiracion]
      );

      const base = process.env.FRONTEND_URL || 'http://localhost:5173';
      const enlace = `${base}/restablecer-password?token=${tokenPlano}`;
      await enviarCorreoRecuperacion({ correo, nombre, enlace });
    }

    res.json(mensajeGenerico);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al procesar la solicitud' });
  }
}

// POST /api/auth/restablecer  { token, password }
async function restablecerPassword(req, res) {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ mensaje: 'Token y nueva contraseña son obligatorios' });
  if (password.length < 8) return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres' });

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    const [filas] = await conexion.query(
      `SELECT id_recuperacion, tipo_cuenta, id_cuenta, fecha_expiracion, usado
       FROM recuperacion_password WHERE token_hash = ? FOR UPDATE`,
      [tokenHash]
    );

    if (filas.length === 0 || filas[0].usado || new Date(filas[0].fecha_expiracion) < new Date()) {
      await conexion.rollback();
      return res.status(400).json({ mensaje: 'El enlace de recuperación es inválido o ya expiró' });
    }

    const recuperacion = filas[0];
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    if (recuperacion.tipo_cuenta === 'EMPLEADO') {
      await conexion.query('UPDATE empleado SET contrasenia = ? WHERE id_empleado = ?', [hash, recuperacion.id_cuenta]);
    } else {
      await conexion.query('UPDATE cliente SET contrasenia = ? WHERE id_cliente = ?', [hash, recuperacion.id_cuenta]);
    }
    await conexion.query('UPDATE recuperacion_password SET usado = 1 WHERE id_recuperacion = ?', [recuperacion.id_recuperacion]);

    await conexion.commit();
    res.json({ mensaje: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });
  } catch (err) {
    await conexion.rollback();
    console.error(err);
    res.status(500).json({ mensaje: 'Error al restablecer la contraseña' });
  } finally {
    conexion.release();
  }
}

module.exports = {
  obtenerCaptcha, registro, registroEmpleado, login, logout, loginGoogle,
  solicitarRecuperacion, restablecerPassword
};
