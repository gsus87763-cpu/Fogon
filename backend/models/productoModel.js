const pool = require('../config/db');

// Por defecto solo devuelve productos activos (estado = 1), con la cantidad ya
// reservada HOY (para calcular cupo restante) cuando el producto tiene cupo_diario.
// El "reinicio diario" del stock no requiere un job: al filtrar por fecha = hoy,
// cada nuevo día empieza a contar desde cero automáticamente.
async function listar({ incluirInactivos = false, categoria = null } = {}) {
  let sql = `
    SELECT p.*, c.nombre AS nombre_carta,
           COALESCE(SUM(CASE
             WHEN r.fecha = CURDATE() AND r.activo = 1 AND r.estado <> 'CANCELADA'
             THEN rp.cantidad ELSE 0
           END), 0) AS reservado_hoy
    FROM PRODUCTO p
    JOIN CARTA c ON c.id_carta = p.id_carta
    LEFT JOIN RESERVA_PRODUCTO rp ON rp.id_producto = p.id_producto
    LEFT JOIN RESERVA r ON r.id_reserva = rp.id_reserva
    WHERE 1=1`;
  const params = [];

  if (!incluirInactivos) sql += ' AND p.estado = 1';
  if (categoria) {
    sql += ' AND p.categoria = ?';
    params.push(categoria);
  }
  sql += ' GROUP BY p.id_producto ORDER BY p.categoria, p.nombre';

  const [filas] = await pool.query(sql, params);
  return filas.map((p) => ({
    ...p,
    disponible_hoy: p.cupo_diario == null ? null : Math.max(0, p.cupo_diario - Number(p.reservado_hoy))
  }));
}

async function obtenerPorId(id) {
  const [filas] = await pool.query('SELECT * FROM PRODUCTO WHERE id_producto = ?', [id]);
  return filas[0] || null;
}

// Cuánto de este producto ya se reservó hoy (reservas activas, no canceladas)
async function reservadoHoy(id_producto) {
  const [filas] = await pool.query(
    `SELECT COALESCE(SUM(rp.cantidad), 0) AS total
     FROM RESERVA_PRODUCTO rp
     JOIN RESERVA r ON r.id_reserva = rp.id_reserva
     WHERE rp.id_producto = ? AND r.fecha = CURDATE() AND r.activo = 1 AND r.estado <> 'CANCELADA'`,
    [id_producto]
  );
  return Number(filas[0].total);
}

async function crear({ id_carta, nombre, descripcion, categoria, precio, unidad_de_medida, imagen_url, cupo_diario }) {
  const [resultado] = await pool.query(
    `INSERT INTO PRODUCTO (id_carta, nombre, descripcion, categoria, precio, unidad_de_medida, imagen_url, cupo_diario, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [id_carta, nombre, descripcion || null, categoria, precio, unidad_de_medida || null, imagen_url || null, cupo_diario ?? null]
  );
  return obtenerPorId(resultado.insertId);
}

async function actualizar(id, { nombre, descripcion, categoria, precio, unidad_de_medida, imagen_url, cupo_diario }) {
  await pool.query(
    `UPDATE PRODUCTO SET nombre = ?, descripcion = ?, categoria = ?, precio = ?, unidad_de_medida = ?,
            imagen_url = ?, cupo_diario = ?
     WHERE id_producto = ?`,
    [nombre, descripcion || null, categoria, precio, unidad_de_medida || null, imagen_url || null, cupo_diario ?? null, id]
  );
  return obtenerPorId(id);
}

// "Eliminar" = soft delete (estado = 0), nunca DELETE físico
async function eliminarLogico(id) {
  await pool.query('UPDATE PRODUCTO SET estado = 0 WHERE id_producto = ?', [id]);
  return obtenerPorId(id);
}

async function restaurar(id) {
  await pool.query('UPDATE PRODUCTO SET estado = 1 WHERE id_producto = ?', [id]);
  return obtenerPorId(id);
}

module.exports = { listar, obtenerPorId, reservadoHoy, crear, actualizar, eliminarLogico, restaurar };
