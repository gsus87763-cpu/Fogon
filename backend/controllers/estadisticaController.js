const pool = require('../config/db');

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
async function ingresosPorMes(req, res) {
  try {
    const [filas] = await pool.query(
      `SELECT DATE_FORMAT(fecha, '%Y-%m') AS mes,
              SUM(CASE WHEN tipo = 'INGRESO' THEN monto ELSE 0 END) AS ingresos,
              SUM(CASE WHEN tipo = 'EGRESO' THEN monto ELSE 0 END) AS egresos
       FROM RECURSO_MONETARIO
       GROUP BY mes
       ORDER BY mes ASC`
    );
    res.json(filas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al calcular estadísticas financieras' });
  }
}

module.exports = { reservasPorDia, ingresosPorMes };
