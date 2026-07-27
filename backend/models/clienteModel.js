const pool = require('../config/db');

async function listar({ incluirInactivos = false, busqueda = null } = {}) {
  let sql = `SELECT c.*,
                    (SELECT COUNT(*) FROM RESERVA r WHERE r.id_cliente = c.id_cliente) AS total_reservas
             FROM CLIENTE c WHERE 1=1`;
  const params = [];

  if (!incluirInactivos) sql += ' AND c.activo = 1';
  if (busqueda) {
    sql += ' AND (c.nombre LIKE ? OR c.apellidos LIKE ? OR c.correo LIKE ? OR c.ci LIKE ?)';
    const patron = `%${busqueda}%`;
    params.push(patron, patron, patron, patron);
  }
  sql += ' ORDER BY c.apellidos, c.nombre';

  const [filas] = await pool.query(sql, params);
  return filas;
}

async function obtenerPorId(id) {
  const [filas] = await pool.query('SELECT * FROM CLIENTE WHERE id_cliente = ?', [id]);
  return filas[0] || null;
}

async function obtenerPorCorreo(correo) {
  const [filas] = await pool.query('SELECT * FROM CLIENTE WHERE correo = ?', [correo]);
  return filas[0] || null;
}

async function crear({ nombre, apellidos, ci, telefono, correo }) {
  const [resultado] = await pool.query(
    'INSERT INTO CLIENTE (nombre, apellidos, ci, telefono, correo) VALUES (?, ?, ?, ?, ?)',
    [nombre, apellidos, ci || null, telefono || null, correo || null]
  );
  return obtenerPorId(resultado.insertId);
}

async function actualizar(id, { nombre, apellidos, ci, telefono, correo }) {
  await pool.query(
    'UPDATE CLIENTE SET nombre = ?, apellidos = ?, ci = ?, telefono = ?, correo = ? WHERE id_cliente = ?',
    [nombre, apellidos, ci || null, telefono || null, correo || null, id]
  );
  return obtenerPorId(id);
}

// "Eliminar" = baja lógica; también desactiva su cuenta de USUARIO si tiene una
async function eliminarLogico(id) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    await conexion.query('UPDATE CLIENTE SET activo = 0 WHERE id_cliente = ?', [id]);
    await conexion.query('UPDATE USUARIO SET activo = 0 WHERE id_cliente = ?', [id]);
    await conexion.commit();
  } catch (err) {
    await conexion.rollback();
    throw err;
  } finally {
    conexion.release();
  }
  return obtenerPorId(id);
}

async function restaurar(id) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    await conexion.query('UPDATE CLIENTE SET activo = 1 WHERE id_cliente = ?', [id]);
    await conexion.query('UPDATE USUARIO SET activo = 1 WHERE id_cliente = ?', [id]);
    await conexion.commit();
  } catch (err) {
    await conexion.rollback();
    throw err;
  } finally {
    conexion.release();
  }
  return obtenerPorId(id);
}

module.exports = { listar, obtenerPorId, obtenerPorCorreo, crear, actualizar, eliminarLogico, restaurar };
