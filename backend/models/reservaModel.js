const pool = require('../config/db');

async function listarPorCliente(id_cliente) {
  const [filas] = await pool.query(
    `SELECT r.*, m.numero AS numero_mesa, a.nombre AS ambiente
     FROM RESERVA r
     JOIN MESA m ON m.id_mesa = r.id_mesa
     JOIN AMBIENTE a ON a.id_ambiente = m.id_ambiente
     WHERE r.id_cliente = ? AND r.activo = 1
     ORDER BY r.fecha DESC, r.hora DESC`,
    [id_cliente]
  );
  // Adjunta el carrito de platos de cada reserva
  for (const reserva of filas) {
    reserva.platos = await obtenerPlatosDeReserva(reserva.id_reserva);
  }
  return filas;
}

async function listarTodas({ fecha = null, estado = null } = {}) {
  let sql = `SELECT r.*, m.numero AS numero_mesa, a.nombre AS ambiente,
                    CONCAT(c.nombre, ' ', c.apellidos) AS cliente
             FROM RESERVA r
             JOIN MESA m ON m.id_mesa = r.id_mesa
             JOIN AMBIENTE a ON a.id_ambiente = m.id_ambiente
             JOIN CLIENTE c ON c.id_cliente = r.id_cliente
             WHERE r.activo = 1`;
  const params = [];
  if (fecha) { sql += ' AND r.fecha = ?'; params.push(fecha); }
  if (estado) { sql += ' AND r.estado = ?'; params.push(estado); }
  sql += ' ORDER BY r.fecha DESC, r.hora DESC';
  const [filas] = await pool.query(sql, params);
  return filas;
}

async function obtenerPorId(id) {
  const [filas] = await pool.query('SELECT * FROM RESERVA WHERE id_reserva = ?', [id]);
  return filas[0] || null;
}

async function obtenerPlatosDeReserva(id_reserva) {
  const [filas] = await pool.query(
    `SELECT rp.id_producto, rp.cantidad, p.nombre, p.precio, p.imagen_url
     FROM RESERVA_PRODUCTO rp
     JOIN PRODUCTO_EMPLATADO p ON p.id_producto_emplatado = rp.id_producto
     WHERE rp.id_reserva = ?`,
    [id_reserva]
  );
  return filas;
}

// Evita doble reserva de la misma mesa en la misma fecha/hora
async function existeChoque({ id_mesa, fecha, hora }) {
  const [filas] = await pool.query(
    `SELECT id_reserva FROM RESERVA
     WHERE id_mesa = ? AND fecha = ? AND hora = ? AND estado IN ('PENDIENTE','CONFIRMADA') AND activo = 1`,
    [id_mesa, fecha, hora]
  );
  return filas.length > 0;
}

// Cuánto de un producto ya está comprometido para una fecha dada (reservas activas)
async function reservadoEnFecha(id_producto, fecha) {
  const [filas] = await pool.query(
    `SELECT COALESCE(SUM(rp.cantidad), 0) AS total
     FROM RESERVA_PRODUCTO rp
     JOIN RESERVA r ON r.id_reserva = rp.id_reserva
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
      `INSERT INTO RESERVA (id_cliente, id_mesa, fecha, hora, cantidad_personas, motivo, estado, fecha_expiracion)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE', DATE_ADD(NOW(), INTERVAL 30 MINUTE))`,
      [id_cliente, id_mesa, fecha, hora, cantidad_personas, motivo || null]
    );
    const id_reserva = resultado.insertId;

    for (const item of platos) {
      const [[producto]] = await conexion.query(
        'SELECT id_producto_emplatado AS id_producto, cupo_diario, estado FROM PRODUCTO_EMPLATADO WHERE id_producto_emplatado = ? FOR UPDATE',
        [item.id_producto]
      );
      if (!producto || !producto.estado) {
        throw new Error(`El plato seleccionado ya no está disponible`);
      }
      if (producto.cupo_diario != null) {
        const [[{ total }]] = await conexion.query(
          `SELECT COALESCE(SUM(rp.cantidad), 0) AS total
           FROM RESERVA_PRODUCTO rp
           JOIN RESERVA r ON r.id_reserva = rp.id_reserva
           WHERE rp.id_producto = ? AND r.fecha = ? AND r.activo = 1 AND r.estado <> 'CANCELADA'`,
          [item.id_producto, fecha]
        );
        const restante = producto.cupo_diario - Number(total);
        if (item.cantidad > restante) {
          throw new Error(`Cupo diario insuficiente para uno de los platos seleccionados (quedan ${Math.max(0, restante)})`);
        }
      }
      await conexion.query(
        'INSERT INTO RESERVA_PRODUCTO (id_reserva, id_producto, cantidad) VALUES (?, ?, ?)',
        [id_reserva, item.id_producto, item.cantidad]
      );
    }

    await conexion.commit();
    const reserva = await obtenerPorId(id_reserva);
    reserva.platos = await obtenerPlatosDeReserva(id_reserva);
    return reserva;
  } catch (err) {
    await conexion.rollback();
    throw err;
  } finally {
    conexion.release();
  }
}

async function cambiarEstado(id, estado) {
  await pool.query('UPDATE RESERVA SET estado = ? WHERE id_reserva = ?', [estado, id]);
  return obtenerPorId(id);
}

// Cancelar libera automáticamente el cupo diario de sus platos, porque el
// cálculo de disponibilidad excluye reservas con estado CANCELADA.
async function cancelar(id) {
  await pool.query(
    "UPDATE RESERVA SET estado = 'CANCELADA', activo = 1 WHERE id_reserva = ?",
    [id]
  );
  return obtenerPorId(id);
}

module.exports = {
  listarPorCliente, listarTodas, obtenerPorId, obtenerPlatosDeReserva,
  existeChoque, reservadoEnFecha, crear, cambiarEstado, cancelar
};
