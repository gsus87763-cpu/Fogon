const pool = require('../config/db');
const financeModel = require('../models/financeModel');

// GET /api/estadisticas/reservas-por-dia -> últimos 14 días
async function reservasPorDia(req, res) {
  try {
    const [filas] = await pool.query(
      `SELECT fecha, COUNT(*) AS total_reservas
       FROM RESERVA
       WHERE activo = 1 AND fecha >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
       GROUP BY fecha
       ORDER BY fecha ASC`
    );
    res.json(filas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al calcular estadísticas de reservas' });
  }
}

// GET /api/estadisticas/ingresos-por-mes
// Ingresos = FACTURA emitida; Egresos = PAGO_EMPLEADO pagado + DETALLE_COMPRA
async function ingresosPorMes(req, res) {
  try {
    const filas = await financeModel.resumenPorMes();
    res.json(filas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al calcular estadísticas financieras' });
  }
}

module.exports = { reservasPorDia, ingresosPorMes };
