const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { generarCaptcha, verificarCaptcha } = require('../utils/captcha');
const { evaluarFortaleza } = require('../utils/passwordStrength');
const { registrarAcceso } = require('../utils/logAcceso');

const SALT_ROUNDS = 12;

// GET /api/auth/captcha
async function obtenerCaptcha(req, res) {
  const { captchaId, svg } = generarCaptcha();
  res.json({ captchaId, svg });
}

// POST /api/auth/password-strength  { password }
function chequearFortaleza(req, res) {
  const { password = '' } = req.body;
  res.json(evaluarFortaleza(password));
}

// POST /api/auth/registro
// { nombre, apellidos, correo, password, telefono }  -> crea CLIENTE + USUARIO con rol 'cliente'
async function registro(req, res) {
  const { nombre, apellidos, correo, password, telefono, captchaId, captchaRespuesta } = req.body;

  if (!nombre || !apellidos || !correo || !password) {
    return res.status(400).json({ mensaje: 'Nombre, apellidos, correo y contraseña son obligatorios' });
  }
  if (!verificarCaptcha(captchaId, captchaRespuesta)) {
    return res.status(400).json({ mensaje: 'CAPTCHA incorrecto o expirado' });
  }
  const fortaleza = evaluarFortaleza(password);
  if (fortaleza.nivel === 'debil') {
    return res.status(400).json({ mensaje: 'La contraseña es demasiado débil', fortaleza });
  }

  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    const [existente] = await conexion.query('SELECT id_usuario FROM USUARIO WHERE correo = ?', [correo]);
    if (existente.length > 0) {
      await conexion.rollback();
      return res.status(409).json({ mensaje: 'Ya existe una cuenta con ese correo' });
    }

    const [clienteResult] = await conexion.query(
      'INSERT INTO CLIENTE (nombre, apellidos, telefono, correo) VALUES (?, ?, ?, ?)',
      [nombre, apellidos, telefono || null, correo]
    );

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const [rolCliente] = await conexion.query("SELECT id_rol FROM ROL WHERE nombre = 'cliente'");

    const [usuarioResult] = await conexion.query(
      'INSERT INTO USUARIO (correo, password_hash, id_rol, id_cliente) VALUES (?, ?, ?, ?)',
      [correo, passwordHash, rolCliente[0].id_rol, clienteResult.insertId]
    );

    await conexion.commit();
    res.status(201).json({ mensaje: 'Cuenta creada correctamente', id_usuario: usuarioResult.insertId });
  } catch (err) {
    await conexion.rollback();
    console.error(err);
    res.status(500).json({ mensaje: 'Error al crear la cuenta' });
  } finally {
    conexion.release();
  }
}

// POST /api/auth/login  { correo, password, captchaId, captchaRespuesta }
async function login(req, res) {
  const { correo, password, captchaId, captchaRespuesta } = req.body;

  if (!verificarCaptcha(captchaId, captchaRespuesta)) {
    return res.status(400).json({ mensaje: 'CAPTCHA incorrecto o expirado' });
  }

  try {
    const [filas] = await pool.query(
      `SELECT u.id_usuario, u.correo, u.password_hash, u.activo, r.nombre AS rol,
              u.id_empleado, u.id_cliente,
              COALESCE(e.nombre, c.nombre) AS nombre
       FROM USUARIO u
       JOIN ROL r ON r.id_rol = u.id_rol
       LEFT JOIN EMPLEADO e ON e.id_empleado = u.id_empleado
       LEFT JOIN CLIENTE c ON c.id_cliente = u.id_cliente
       WHERE u.correo = ?`,
      [correo]
    );

    if (filas.length === 0) {
      await registrarAcceso({ correoUsado: correo, tipoEvento: 'INGRESO_FALLIDO', req });
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const usuario = filas[0];
    if (!usuario.activo) {
      return res.status(403).json({ mensaje: 'Cuenta inactiva, contacte al administrador' });
    }

    const coincide = await bcrypt.compare(password, usuario.password_hash);
    if (!coincide) {
      await registrarAcceso({ idUsuario: usuario.id_usuario, correoUsado: correo, tipoEvento: 'INGRESO_FALLIDO', req });
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const payload = {
      id_usuario: usuario.id_usuario,
      rol: usuario.rol,
      nombre: usuario.nombre,
      correo: usuario.correo
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    });

    await registrarAcceso({ idUsuario: usuario.id_usuario, correoUsado: correo, tipoEvento: 'INGRESO', req });

    res.json({ token, usuario: payload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al iniciar sesión' });
  }
}

// POST /api/auth/logout  (requiere token)
async function logout(req, res) {
  try {
    await registrarAcceso({
      idUsuario: req.user.id_usuario,
      correoUsado: req.user.correo,
      tipoEvento: 'SALIDA',
      req
    });
    res.json({ mensaje: 'Sesión cerrada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al cerrar sesión' });
  }
}

module.exports = { obtenerCaptcha, chequearFortaleza, registro, login, logout };
