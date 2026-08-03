const pool = require('../config/db');

async function existePorCorreoOCi(correo, ci) {
  const [filas] = await pool.query(
    'SELECT id_empleado FROM empleado WHERE correo_electronico = ? OR (ci = ? AND ci IS NOT NULL)',
    [correo, ci || null]
  );
  return filas.length > 0;
}

// Crea la solicitud de un empleado nuevo: queda "Pendiente" hasta que
// administración la apruebe (no puede iniciar sesión todavía).
async function crearSolicitud({ nombre, apellidos, ci, telefono, correo, hash }) {
  const [resultado] = await pool.query(
    `INSERT INTO empleado (nombre, apellidos, ci, telefono, estado, correo_electronico, contrasenia)
     VALUES (?, ?, ?, ?, 'Pendiente', ?, ?)`,
    [nombre, apellidos, ci || null, telefono || null, correo, hash]
  );
  return obtenerPorId(resultado.insertId);
}

async function obtenerPorId(id) {
  const [filas] = await pool.query(
    `SELECT id_empleado, nombre, apellidos, ci, telefono, estado, motivo_rechazo, rol_manual, correo_electronico
     FROM empleado WHERE id_empleado = ?`,
    [id]
  );
  return filas[0] || null;
}

// Lista solicitudes/empleados filtrando por estado (por defecto, las
// pendientes de aprobación, que es lo que necesita el panel de RRHH/admin).
async function listar({ estado = 'Pendiente' } = {}) {
  let sql = `SELECT id_empleado, nombre, apellidos, ci, telefono, estado, motivo_rechazo, rol_manual, correo_electronico
             FROM empleado WHERE 1=1`;
  const params = [];
  if (estado) { sql += ' AND estado = ?'; params.push(estado); }
  sql += ' ORDER BY id_empleado DESC';
  const [filas] = await pool.query(sql, params);
  return filas;
}

// Aprueba la solicitud: pasa a 'Activo' y guarda el rol elegido
// (rol_manual), que es lo que usa el login para armar el token. Si el
// rol es 'admin' o 'cocina', además lo registra en su tabla
// correspondiente (algunas partes del sistema todavía las consultan).
async function aprobar(id, rol) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    await conexion.query(
      "UPDATE empleado SET estado = 'Activo', motivo_rechazo = NULL, rol_manual = ? WHERE id_empleado = ?",
      [rol, id]
    );
    if (rol === 'admin') {
      await conexion.query('INSERT INTO administrador (id_empleado) VALUES (?)', [id]);
    } else if (rol === 'cocina') {
      await conexion.query('INSERT INTO cocinero (id_empleado, especialidad) VALUES (?, NULL)', [id]);
    }
    await conexion.commit();
    return obtenerPorId(id);
  } catch (err) {
    await conexion.rollback();
    throw err;
  } finally {
    conexion.release();
  }
}

async function rechazar(id, motivo) {
  await pool.query(
    "UPDATE empleado SET estado = 'Rechazado', motivo_rechazo = ? WHERE id_empleado = ?",
    [motivo || null, id]
  );
  return obtenerPorId(id);
}

module.exports = { existePorCorreoOCi, crearSolicitud, obtenerPorId, listar, aprobar, rechazar };
