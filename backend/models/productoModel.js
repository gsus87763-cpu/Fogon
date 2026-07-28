const pool = require('../config/db');

// "producto_emplatado" es la carta de platos (lo que antes era PRODUCTO).
// Se expone como id_producto/precio para no romper el frontend existente.
const SELECT_BASE = `
  SELECT pe.id_producto_emplatado AS id_producto,
         pe.nombre, pe.descripcion, pe.categoria, pe.costo AS precio,
<<<<<<< HEAD
         pe.imagen_url, pe.estado, pe.cupo_diario, pe.id_carta,
=======
         pe.imagen_url, pe.estado, pe.id_carta,
>>>>>>> a8ece06d7bda7dd5174b157bf6a288520c5275dd
         c.nombre AS nombre_carta
  FROM producto_emplatado pe
  LEFT JOIN carta c ON c.id_carta = pe.id_carta
  WHERE 1=1`;

async function listar({ incluirInactivos = false, categoria = null } = {}) {
  let sql = SELECT_BASE;
  const params = [];
  if (!incluirInactivos) sql += ' AND pe.estado = 1';
  if (categoria) { sql += ' AND pe.categoria = ?'; params.push(categoria); }
  sql += ' ORDER BY pe.categoria, pe.nombre';

  const [filas] = await pool.query(sql, params);
  return filas;
}

async function obtenerPorId(id) {
  const [filas] = await pool.query(`${SELECT_BASE} AND pe.id_producto_emplatado = ?`, [id]);
  return filas[0] || null;
}

<<<<<<< HEAD
async function crear({ id_carta, nombre, descripcion, categoria, precio, imagen_url, cupo_diario }) {
  const [resultado] = await pool.query(
    `INSERT INTO producto_emplatado (nombre, descripcion, categoria, costo, imagen_url, cupo_diario, estado, id_carta)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
    [nombre, descripcion || null, categoria || null, precio, imagen_url || null, cupo_diario ?? null, id_carta || null]
=======
async function crear({ id_carta, nombre, descripcion, categoria, precio, imagen_url }) {
  const [resultado] = await pool.query(
    `INSERT INTO producto_emplatado (nombre, descripcion, categoria, costo, imagen_url, estado, id_carta)
     VALUES (?, ?, ?, ?, ?, 1, ?)`,
    [nombre, descripcion || null, categoria || null, precio, imagen_url || null, id_carta || null]
>>>>>>> a8ece06d7bda7dd5174b157bf6a288520c5275dd
  );
  return obtenerPorId(resultado.insertId);
}

<<<<<<< HEAD
async function actualizar(id, { nombre, descripcion, categoria, precio, imagen_url, cupo_diario, id_carta }) {
  await pool.query(
    `UPDATE producto_emplatado
        SET nombre = ?, descripcion = ?, categoria = ?, costo = ?, imagen_url = ?, cupo_diario = ?, id_carta = ?
      WHERE id_producto_emplatado = ?`,
    [nombre, descripcion || null, categoria || null, precio, imagen_url || null, cupo_diario ?? null, id_carta || null, id]
=======
async function actualizar(id, { nombre, descripcion, categoria, precio, imagen_url, id_carta }) {
  await pool.query(
    `UPDATE producto_emplatado
        SET nombre = ?, descripcion = ?, categoria = ?, costo = ?, imagen_url = ?, id_carta = ?
      WHERE id_producto_emplatado = ?`,
    [nombre, descripcion || null, categoria || null, precio, imagen_url || null, id_carta || null, id]
>>>>>>> a8ece06d7bda7dd5174b157bf6a288520c5275dd
  );
  return obtenerPorId(id);
}

// "Eliminar" = baja lógica (estado = 0), nunca DELETE físico
async function eliminarLogico(id) {
  await pool.query('UPDATE producto_emplatado SET estado = 0 WHERE id_producto_emplatado = ?', [id]);
  return obtenerPorId(id);
}

async function restaurar(id) {
  await pool.query('UPDATE producto_emplatado SET estado = 1 WHERE id_producto_emplatado = ?', [id]);
  return obtenerPorId(id);
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminarLogico, restaurar };
