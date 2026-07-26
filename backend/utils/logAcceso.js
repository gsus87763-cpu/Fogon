const pool = require('../config/db');

/**
 * Inserta un registro en LOG_ACCESO.
 * tipoEvento: 'INGRESO' | 'SALIDA' | 'INGRESO_FALLIDO'
 */
async function registrarAcceso({ idUsuario = null, correoUsado, tipoEvento, req }) {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString();
  const userAgent = req.headers['user-agent'] || '';

  await pool.query(
    `INSERT INTO LOG_ACCESO (id_usuario, correo_usado, tipo_evento, direccion_ip, user_agent)
     VALUES (?, ?, ?, ?, ?)`,
    [idUsuario, correoUsado, tipoEvento, ip, userAgent]
  );
}

module.exports = { registrarAcceso };
