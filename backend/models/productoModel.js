const pool = require('../config/db');

// "Producto" aquí = plato de la carta pública (tabla PRODUCTO_EMPLATADO).
// OJO: existe otra tabla llamada PRODUCTO que es insumo de almacén (stock,
// marca, fecha de vencimiento) — esa se administra desde el CRUD genérico
// de admin, no desde aquí. Para no tocar el resto del código (frontend,
// reservaModel, etc.) seguimos exponiendo el campo como "id_producto" en
// el JSON de salida, aunque en la tabla real la columna se llame
// id_producto_emplatado.

const SELECT_BASE = `
  SELECT p.id_producto_emplatado AS id_producto, p.nombre, p.descripcion, p.categoria,
         p.precio, p.unidad_de_medida, p.imagen_url, p.cupo_diario, p.estado, p.id_carta,
         c.nombre AS nombre_carta`;

// Por defecto solo devuelve productos activos (estado = 1), con la cantidad ya
// reservada HOY (para calcular cupo restante) cuando el producto tiene cupo_diario.
// El "reinicio diario" del stock no requiere un job: al filtrar por fecha = hoy,
// cada nuevo día empieza a contar desde cero automáticamente.
async function listar({ incluirInactivos = false, categoria = null } = {}) {
  let sql = `
    ${SELECT_BASE},
           COALESCE(SUM(CASE
             WHEN r.fecha = CURDATE() AND r.activo = 1 AND r.estado <> 'CANCELADA'
             THEN rp.cantidad ELSE 0
           END), 0) AS reservado_hoy
    FROM PRODUCTO_EMPLATADO p
    JOIN CARTA c ON c.id_carta = p.id_carta
    LEFT JOIN RESERVA_PRODUCTO rp ON rp.id_producto = p.id_producto_emplatado
    LEFT JOIN RESERVA r ON r.id_reserva = rp.id_reserva
    WHERE 1=1`;
  const params = [];

  if (!incluirInactivos) sql += ' AND p.estado = 1';
  if (categoria) {
    sql += ' AND p.categoria = ?';
    params.push(categoria);
  }
  sql += ' GROUP BY p.id_producto_emplatado ORDER BY p.categoria, p.nombre';

  const [filas] = await pool.query(sql, params);
  return filas.map((p) => ({
    ...p,
    disponible_hoy: p.cupo_diario == null ? null : Math.max(0, p.cupo_diario - Number(p.reservado_hoy))
  }));
}

async function obtenerPorId(id) {
  const [filas] = await pool.query(`${SELECT_BASE} FROM PRODUCTO_EMPLATADO p JOIN CARTA c ON c.id_carta = p.id_carta WHERE p.id_producto_emplatado = ?`, [id]);
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
    `INSERT INTO PRODUCTO_EMPLATADO (id_carta, nombre, descripcion, categoria, precio, unidad_de_medida, imagen_url, cupo_diario, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [id_carta, nombre, descripcion || null, categoria, precio, unidad_de_medida || null, imagen_url || null, cupo_diario ?? null]
  );
  return obtenerPorId(resultado.insertId);
}

async function actualizar(id, { nombre, descripcion, categoria, precio, unidad_de_medida, imagen_url, cupo_diario }) {
  await pool.query(
    `UPDATE PRODUCTO_EMPLATADO SET nombre = ?, descripcion = ?, categoria = ?, precio = ?, unidad_de_medida = ?,
            imagen_url = ?, cupo_diario = ?
     WHERE id_producto_emplatado = ?`,
    [nombre, descripcion || null, categoria, precio, unidad_de_medida || null, imagen_url || null, cupo_diario ?? null, id]
  );
  return obtenerPorId(id);
}

// "Eliminar" = soft delete (estado = 0), nunca DELETE físico
async function eliminarLogico(id) {
  await pool.query('UPDATE PRODUCTO_EMPLATADO SET estado = 0 WHERE id_producto_emplatado = ?', [id]);
  return obtenerPorId(id);
}

async function restaurar(id) {
  await pool.query('UPDATE PRODUCTO_EMPLATADO SET estado = 1 WHERE id_producto_emplatado = ?', [id]);
  return obtenerPorId(id);
}

module.exports = { listar, obtenerPorId, reservadoHoy, crear, actualizar, eliminarLogico, restaurar };
