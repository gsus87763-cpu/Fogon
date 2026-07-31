const pool = require('../config/db');

// ---------------------------------------------------------------------
// PAGO empleado
// ---------------------------------------------------------------------

async function listarPagosEmpleado({ desde = null, hasta = null, id_empleado = null } = {}) {
  let sql = `SELECT p.*, CONCAT(e.nombre, ' ', e.apellidos) AS empleado
             FROM pago_empleado p
             JOIN empleado e ON e.id_empleado = p.id_empleado
             WHERE 1=1`;
  const params = [];
  if (desde) { sql += ' AND p.fecha_pago >= ?'; params.push(desde); }
  if (hasta) { sql += ' AND p.fecha_pago <= ?'; params.push(hasta); }
  if (id_empleado) { sql += ' AND p.id_empleado = ?'; params.push(id_empleado); }
  sql += ' ORDER BY p.fecha_pago DESC';

  const [filas] = await pool.query(sql, params);
  return filas;
}

// Usa el procedimiento almacenado sp_registrar_pago_empleado (TRANSACCIÓN +
// validación de empleado activo dentro de la propia base de datos).
async function registrarPagoEmpleado({ id_empleado, concepto, periodo, monto, fecha_pago, id_registrado_por }) {
  const conexion = await pool.getConnection();
  try {
    await conexion.query(
      'CALL sp_registrar_pago_empleado(?, ?, ?, ?, ?, ?, @id_pago)',
      [id_empleado, concepto, periodo || null, monto, fecha_pago, id_registrado_por || null]
    );
    const [[{ id_pago }]] = await conexion.query('SELECT @id_pago AS id_pago');
    const [filas] = await conexion.query(
      `SELECT p.*, CONCAT(e.nombre, ' ', e.apellidos) AS empleado
       FROM pago_empleado p JOIN empleado e ON e.id_empleado = p.id_empleado
       WHERE p.id_pago = ?`,
      [id_pago]
    );
    return filas[0];
  } finally {
    conexion.release();
  }
}

async function anularPagoEmpleado(id) {
  await pool.query("UPDATE pago_empleado SET estado = 'ANULADO' WHERE id_pago = ?", [id]);
  const [filas] = await pool.query('SELECT * FROM pago_empleado WHERE id_pago = ?', [id]);
  return filas[0] || null;
}

// ---------------------------------------------------------------------
// factura
// ---------------------------------------------------------------------

async function listarFacturas({ desde = null, hasta = null } = {}) {
  let sql = `SELECT f.*, CONCAT(c.nombre, ' ', c.apellidos) AS cliente
             FROM factura f JOIN cliente c ON c.id_cliente = f.id_cliente
             WHERE 1=1`;
  const params = [];
  if (desde) { sql += ' AND f.fecha_emision >= ?'; params.push(desde); }
  if (hasta) { sql += ' AND f.fecha_emision <= ?'; params.push(hasta); }
  sql += ' ORDER BY f.fecha_emision DESC, f.id_factura DESC';

  const [filas] = await pool.query(sql, params);
  return filas;
}

async function siguienteNumeroFactura() {
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM factura');
  return `FAC-${String(total + 1).padStart(4, '0')}`;
}

// Usa el procedimiento almacenado sp_generar_factura (TRANSACCIÓN + función
// fn_total_reserva). Devuelve la factura recién creada.
async function generarFactura({ id_reserva, metodo_pago }) {
  const conexion = await pool.getConnection();
  try {
    const numero = await siguienteNumeroFactura();
    await conexion.query(
      'CALL sp_generar_factura(?, ?, ?, @id_factura)',
      [id_reserva, numero, metodo_pago || 'EFECTIVO']
    );
    const [[{ id_factura }]] = await conexion.query('SELECT @id_factura AS id_factura');
    const [filas] = await conexion.query(
      `SELECT f.*, CONCAT(c.nombre, ' ', c.apellidos) AS cliente
       FROM factura f JOIN cliente c ON c.id_cliente = f.id_cliente WHERE f.id_factura = ?`,
      [id_factura]
    );
    return filas[0];
  } finally {
    conexion.release();
  }
}

async function anularFactura(id) {
  await pool.query("UPDATE factura SET estado = 'ANULADA' WHERE id_factura = ?", [id]);
  const [filas] = await pool.query('SELECT * FROM factura WHERE id_factura = ?', [id]);
  return filas[0] || null;
}

// ---------------------------------------------------------------------
// DETALLE DE COMPRA (cabecera + ítems)
// ---------------------------------------------------------------------

async function listarCompras({ desde = null, hasta = null } = {}) {
  let sql = `SELECT d.*, a.nombre AS almacen
             FROM detalle_compra d JOIN almacen a ON a.id_almacen = d.id_almacen
             WHERE 1=1`;
  const params = [];
  if (desde) { sql += ' AND d.fecha_emision >= ?'; params.push(desde); }
  if (hasta) { sql += ' AND d.fecha_emision <= ?'; params.push(hasta); }
  sql += ' ORDER BY d.fecha_emision DESC, d.id_detalle DESC';

  const [compras] = await pool.query(sql, params);
  for (const compra of compras) {
    const [items] = await pool.query('SELECT * FROM detalle_compra_item WHERE id_detalle = ?', [compra.id_detalle]);
    compra.items = items;
  }
  return compras;
}

// Crea la cabecera de la compra y sus ítems en una TRANSACCIÓN. El monto de
// la cabecera lo termina fijando el trigger trg_compra_item_after_insert al
// insertar cada ítem (recorre con CURSOR dentro de sp_recalcular_monto_compra).
async function crearCompra({ id_almacen, proveedor, fecha_emision, items = [] }) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    const [resultado] = await conexion.query(
      'INSERT INTO detalle_compra (id_almacen, proveedor, fecha_emision, monto) VALUES (?, ?, ?, 0)',
      [id_almacen, proveedor, fecha_emision]
    );
    const id_detalle = resultado.insertId;

    for (const item of items) {
      await conexion.query(
        'INSERT INTO detalle_compra_item (id_detalle, descripcion, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [id_detalle, item.descripcion, item.cantidad, item.precio_unitario]
      );
    }

    await conexion.commit();

    const [[compra]] = await conexion.query('SELECT * FROM detalle_compra WHERE id_detalle = ?', [id_detalle]);
    const [detalleItems] = await conexion.query('SELECT * FROM detalle_compra_item WHERE id_detalle = ?', [id_detalle]);
    compra.items = detalleItems;
    return compra;
  } catch (err) {
    await conexion.rollback();
    throw err;
  } finally {
    conexion.release();
  }
}

async function agregarItemCompra(id_detalle, { descripcion, cantidad, precio_unitario }) {
  await pool.query(
    'INSERT INTO detalle_compra_item (id_detalle, descripcion, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
    [id_detalle, descripcion, cantidad, precio_unitario]
  );
  const [[compra]] = await pool.query('SELECT * FROM detalle_compra WHERE id_detalle = ?', [id_detalle]);
  const [items] = await pool.query('SELECT * FROM detalle_compra_item WHERE id_detalle = ?', [id_detalle]);
  compra.items = items;
  return compra;
}

async function eliminarItemCompra(id_detalle, id_detalle_item) {
  await pool.query('DELETE FROM detalle_compra_item WHERE id_detalle_item = ? AND id_detalle = ?', [id_detalle_item, id_detalle]);
  const [[compra]] = await pool.query('SELECT * FROM detalle_compra WHERE id_detalle = ?', [id_detalle]);
  const [items] = await pool.query('SELECT * FROM detalle_compra_item WHERE id_detalle = ?', [id_detalle]);
  compra.items = items;
  return compra;
}

// ---------------------------------------------------------------------
// RESUMEN (para estadísticas / dashboard financiero)
// ---------------------------------------------------------------------

async function resumenPorMes() {
  const [filas] = await pool.query(`
    SELECT mes,
           SUM(ingresos) AS ingresos,
           SUM(egresos) AS egresos
    FROM (
      SELECT DATE_FORMAT(fecha_emision, '%Y-%m') AS mes, SUM(monto_total) AS ingresos, 0 AS egresos
      FROM factura WHERE estado = 'EMITIDA' GROUP BY mes
      UNION ALL
      SELECT DATE_FORMAT(fecha_pago, '%Y-%m') AS mes, 0 AS ingresos, SUM(monto) AS egresos
      FROM pago_empleado WHERE estado = 'PAGADO' GROUP BY mes
      UNION ALL
      SELECT DATE_FORMAT(fecha_emision, '%Y-%m') AS mes, 0 AS ingresos, SUM(monto) AS egresos
      FROM detalle_compra GROUP BY mes
    ) t
    GROUP BY mes ORDER BY mes ASC`);
  return filas;
}

module.exports = {
  listarPagosEmpleado, registrarPagoEmpleado, anularPagoEmpleado,
  listarFacturas, generarFactura, anularFactura,
  listarCompras, crearCompra, agregarItemCompra, eliminarItemCompra,
  resumenPorMes
};
