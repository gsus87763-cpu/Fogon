const pool = require('../config/db');
const { generarCodigoPago } = require('../utils/qrPago');

// Seña mínima por persona cuando la reserva no trae platos anticipados
// (o el carrito no alcanza esa mínima). Cubre la mesa aunque el cliente
// decida pedir todo en el momento. Configurable por variable de entorno.
const SENA_POR_PERSONA = Number(process.env.RESERVA_SENA_POR_PERSONA || 15);
const VIGENCIA_PAGO_MINUTOS = 30;

async function listarPorCliente(id_cliente) {
  const [filas] = await pool.query(
    `SELECT r.*, m.numero AS numero_mesa, a.nombre AS ambiente
     FROM reserva r
     JOIN mesa m ON m.id_mesa = r.id_mesa
     JOIN ambiente a ON a.id_ambiente = m.id_ambiente
     WHERE r.id_cliente = ? AND r.activo = 1
     ORDER BY r.fecha DESC, r.hora DESC`,
    [id_cliente]
  );
  // Adjunta el carrito de platos y el estado de pago vigente de cada reserva
  for (const reserva of filas) {
    reserva.platos = await obtenerPlatosDeReserva(reserva.id_reserva);
    const pago = await obtenerPagoVigente(reserva.id_reserva);
    reserva.estado_pago = pago ? pago.estado : null;
  }
  return filas;
}

async function listarTodas({ fecha = null, estado = null } = {}) {
  let sql = `SELECT r.*, m.numero AS numero_mesa, a.nombre AS ambiente,
                    CONCAT(c.nombre, ' ', c.apellidos) AS cliente
             FROM reserva r
             JOIN mesa m ON m.id_mesa = r.id_mesa
             JOIN ambiente a ON a.id_ambiente = m.id_ambiente
             JOIN cliente c ON c.id_cliente = r.id_cliente
             WHERE r.activo = 1`;
  const params = [];
  if (fecha) { sql += ' AND r.fecha = ?'; params.push(fecha); }
  if (estado) { sql += ' AND r.estado = ?'; params.push(estado); }
  sql += ' ORDER BY r.fecha DESC, r.hora DESC';
  const [filas] = await pool.query(sql, params);
  for (const reserva of filas) {
    const pago = await obtenerPagoVigente(reserva.id_reserva);
    reserva.pago = pago ? { codigo: pago.codigo, monto: pago.monto, estado: pago.estado } : null;
  }
  return filas;
}

// Igual que obtenerPorId, pero con los datos legibles (mesa, ambiente,
// cliente) que necesita el comprobante de pago en PDF.
async function obtenerDetallado(id) {
  const [filas] = await pool.query(
    `SELECT r.*, m.numero AS numero_mesa, a.nombre AS ambiente,
            CONCAT(c.nombre, ' ', c.apellidos) AS cliente, c.correo
     FROM reserva r
     JOIN mesa m ON m.id_mesa = r.id_mesa
     JOIN ambiente a ON a.id_ambiente = m.id_ambiente
     JOIN cliente c ON c.id_cliente = r.id_cliente
     WHERE r.id_reserva = ?`,
    [id]
  );
  return filas[0] || null;
}

async function obtenerPorId(id) {
  const [filas] = await pool.query('SELECT * FROM reserva WHERE id_reserva = ?', [id]);
  return filas[0] || null;
}

async function obtenerPlatosDeReserva(id_reserva) {
  const [filas] = await pool.query(
    `SELECT rp.id_producto, rp.cantidad, p.nombre, p.costo AS precio, p.imagen_url
     FROM reserva_producto rp
     JOIN producto_emplatado p ON p.id_producto_emplatado = rp.id_producto
     WHERE rp.id_reserva = ?`,
    [id_reserva]
  );
  return filas;
}

// Evita doble reserva de la misma mesa en la misma fecha/hora
async function existeChoque({ id_mesa, fecha, hora }) {
  const [filas] = await pool.query(
    `SELECT id_reserva FROM reserva
     WHERE id_mesa = ? AND fecha = ? AND hora = ? AND estado IN ('PENDIENTE','CONFIRMADA') AND activo = 1`,
    [id_mesa, fecha, hora]
  );
  return filas.length > 0;
}

// Cuánto de un producto ya está comprometido para una fecha dada (reservas activas)
async function reservadoEnFecha(id_producto, fecha) {
  const [filas] = await pool.query(
    `SELECT COALESCE(SUM(rp.cantidad), 0) AS total
     FROM reserva_producto rp
     JOIN reserva r ON r.id_reserva = rp.id_reserva
     WHERE rp.id_producto = ? AND r.fecha = ? AND r.activo = 1 AND r.estado <> 'CANCELADA'`,
    [id_producto, fecha]
  );
  return Number(filas[0].total);
}

// Crea la reserva y, si se indicó un carrito de platos, valida cupo diario
// restante por producto y lo inserta en la misma transacción.
async function crear({ id_cliente, id_mesa, fecha, hora, cantidad_personas, motivo, platos = [] }) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    const [resultado] = await conexion.query(
      `INSERT INTO reserva (id_cliente, id_mesa, fecha, hora, cantidad_personas, motivo, estado, fecha_expiracion)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE', DATE_ADD(NOW(), INTERVAL 30 MINUTE))`,
      [id_cliente, id_mesa, fecha, hora, cantidad_personas, motivo || null]
    );
    const id_reserva = resultado.insertId;

    for (const item of platos) {
      const [[producto]] = await conexion.query(
        'SELECT id_producto_emplatado AS id_producto, cupo_diario, estado FROM producto_emplatado WHERE id_producto_emplatado = ? FOR UPDATE',
        [item.id_producto]
      );
      if (!producto || !producto.estado) {
        throw new Error(`El plato seleccionado ya no está disponible`);
      }
      if (producto.cupo_diario != null) {
        const [[{ total }]] = await conexion.query(
          `SELECT COALESCE(SUM(rp.cantidad), 0) AS total
           FROM reserva_producto rp
           JOIN reserva r ON r.id_reserva = rp.id_reserva
           WHERE rp.id_producto = ? AND r.fecha = ? AND r.activo = 1 AND r.estado <> 'CANCELADA'`,
          [item.id_producto, fecha]
        );
        const restante = producto.cupo_diario - Number(total);
        if (item.cantidad > restante) {
          throw new Error(`Cupo diario insuficiente para uno de los platos seleccionados (quedan ${Math.max(0, restante)})`);
        }
      }
      await conexion.query(
        'INSERT INTO reserva_producto (id_reserva, id_producto, cantidad) VALUES (?, ?, ?)',
        [id_reserva, item.id_producto, item.cantidad]
      );
    }

    await conexion.commit();
    const reserva = await obtenerPorId(id_reserva);
    reserva.platos = await obtenerPlatosDeReserva(id_reserva);

    const monto = calcularMontoReserva(reserva.platos, cantidad_personas);
    reserva.pago = await crearPagoQR(id_reserva, monto);
    return reserva;
  } catch (err) {
    await conexion.rollback();
    throw err;
  } finally {
    conexion.release();
  }
}

// Calcula el monto a cobrar por una reserva: el total del carrito de
// platos (si trae), o la seña mínima por persona si el carrito no
// alcanza ese mínimo (o la reserva no trae platos).
function calcularMontoReserva(platos, cantidad_personas) {
  const totalPlatos = (platos || []).reduce(
    (acc, p) => acc + Number(p.precio) * Number(p.cantidad), 0
  );
  const senaMinima = SENA_POR_PERSONA * Number(cantidad_personas || 1);
  return Math.max(totalPlatos, senaMinima);
}

// Crea una nueva solicitud de cobro (QR) para una reserva. Cualquier
// solicitud PENDIENTE anterior de esa reserva queda invalidada, para que
// nunca haya dos códigos "vivos" al mismo tiempo.
async function crearPagoQR(id_reserva, monto) {
  await pool.query(
    "UPDATE pago_reserva SET estado = 'RECHAZADO', observacion = 'Reemplazado por un nuevo QR' WHERE id_reserva = ? AND estado = 'PENDIENTE'",
    [id_reserva]
  );
  const codigo = generarCodigoPago();
  await pool.query(
    `INSERT INTO pago_reserva (id_reserva, codigo, monto, estado, fecha_expiracion)
     VALUES (?, ?, ?, 'PENDIENTE', DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
    [id_reserva, codigo, monto, VIGENCIA_PAGO_MINUTOS]
  );
  return obtenerPagoVigente(id_reserva);
}

// Trae el pago más reciente de una reserva (vigente o resuelto).
async function obtenerPagoVigente(id_reserva) {
  const [filas] = await pool.query(
    'SELECT * FROM pago_reserva WHERE id_reserva = ? ORDER BY id_pago DESC LIMIT 1',
    [id_reserva]
  );
  return filas[0] || null;
}

async function obtenerPagoPorId(id_pago) {
  const [filas] = await pool.query('SELECT * FROM pago_reserva WHERE id_pago = ?', [id_pago]);
  return filas[0] || null;
}

// Aprueba o rechaza un pago (lo hace el personal de caja/salón/admin al
// verificar el QR). Si se aprueba, la reserva pasa a CONFIRMADA (activa).
async function resolverPago(id_pago, { aprobar, id_empleado, observacion }) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    const [[pago]] = await conexion.query('SELECT * FROM pago_reserva WHERE id_pago = ? FOR UPDATE', [id_pago]);
    if (!pago) throw new Error('El pago indicado no existe');
    if (pago.estado !== 'PENDIENTE') throw new Error('Este pago ya fue procesado anteriormente');
    if (new Date(pago.fecha_expiracion) < new Date()) throw new Error('El QR de pago expiró, genera uno nuevo');

    const nuevoEstado = aprobar ? 'APROBADO' : 'RECHAZADO';
    await conexion.query(
      'UPDATE pago_reserva SET estado = ?, fecha_resolucion = NOW(), id_procesado_por = ?, observacion = ? WHERE id_pago = ?',
      [nuevoEstado, id_empleado || null, observacion || null, id_pago]
    );
    if (aprobar) {
      await conexion.query("UPDATE reserva SET estado = 'CONFIRMADA' WHERE id_reserva = ?", [pago.id_reserva]);
    }
    await conexion.commit();
    return { pago: await obtenerPagoPorId(id_pago), reserva: await obtenerPorId(pago.id_reserva) };
  } catch (err) {
    await conexion.rollback();
    throw err;
  } finally {
    conexion.release();
  }
}

async function cambiarEstado(id, estado) {
  await pool.query('UPDATE reserva SET estado = ? WHERE id_reserva = ?', [estado, id]);
  return obtenerPorId(id);
}

// Cancelar libera automáticamente el cupo diario de sus platos, porque el
// cálculo de disponibilidad excluye reservas con estado CANCELADA.
async function cancelar(id) {
  await pool.query(
    "UPDATE reserva SET estado = 'CANCELADA', activo = 1 WHERE id_reserva = ?",
    [id]
  );
  return obtenerPorId(id);
}

module.exports = {
  listarPorCliente, listarTodas, obtenerPorId, obtenerDetallado, obtenerPlatosDeReserva,
  existeChoque, reservadoEnFecha, crear, cambiarEstado, cancelar,
  calcularMontoReserva, crearPagoQR, obtenerPagoVigente, obtenerPagoPorId, resolverPago
};
