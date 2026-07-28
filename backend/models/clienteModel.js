const pool = require('../config/db');

// Nunca incluye `contrasenia`/`google_id` en el SELECT: esos campos no
// deben viajar al frontend del panel de administración.
const SELECT_BASE = `SELECT id_cliente, nombre, apellidos, ci, telefono, correo, fecha_nacimiento, activo, proveedor FROM cliente`;

async function listar({ incluirInactivos = false, busqueda = null } = {}) {
  let sql = `${SELECT_BASE} WHERE 1=1`;
  const params = [];

  if (!incluirInactivos) sql += ' AND activo = 1';
  if (busqueda) {
    sql += ' AND (nombre LIKE ? OR apellidos LIKE ? OR correo LIKE ? OR ci LIKE ?)';
    const patron = `%${busqueda}%`;
    params.push(patron, patron, patron, patron);
  }
  sql += ' ORDER BY apellidos, nombre';

  const [filas] = await pool.query(sql, params);
  return filas;
}

async function obtenerPorId(id) {
  const [filas] = await pool.query(`${SELECT_BASE} WHERE id_cliente = ?`, [id]);
  return filas[0] || null;
}

async function obtenerPorCorreo(correo) {
  const [filas] = await pool.query(`${SELECT_BASE} WHERE correo = ?`, [correo]);
  return filas[0] || null;
}

async function crear({ nombre, apellidos, ci, telefono, correo, fecha_nacimiento }) {
  const [resultado] = await pool.query(
    'INSERT INTO cliente (nombre, apellidos, ci, telefono, correo, fecha_nacimiento) VALUES (?, ?, ?, ?, ?, ?)',
    [nombre, apellidos, ci || null, telefono || null, correo || null, fecha_nacimiento || null]
  );
  return obtenerPorId(resultado.insertId);
}

async function actualizar(id, { nombre, apellidos, ci, telefono, correo, fecha_nacimiento }) {
  await pool.query(
    'UPDATE cliente SET nombre = ?, apellidos = ?, ci = ?, telefono = ?, correo = ?, fecha_nacimiento = ? WHERE id_cliente = ?',
    [nombre, apellidos, ci || null, telefono || null, correo || null, fecha_nacimiento || null, id]
  );
  return obtenerPorId(id);
}

// "Eliminar" = baja lógica (activo = 0), nunca DELETE físico
async function eliminarLogico(id) {
  await pool.query('UPDATE cliente SET activo = 0 WHERE id_cliente = ?', [id]);
  return obtenerPorId(id);
}

async function restaurar(id) {
  await pool.query('UPDATE cliente SET activo = 1 WHERE id_cliente = ?', [id]);
  return obtenerPorId(id);
}

module.exports = { listar, obtenerPorId, obtenerPorCorreo, crear, actualizar, eliminarLogico, restaurar };
