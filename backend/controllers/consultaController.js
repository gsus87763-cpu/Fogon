const pool = require('../config/db');

/**
 * Consola de consultas SQL para el rol admin. Permite escribir cualquier
 * sentencia (SELECT, INSERT, UPDATE, DELETE, incluso DDL) contra la misma
 * BD de Railway que usa el resto de la API, para depuración o consultas
 * puntuales que no ameritan un endpoint dedicado.
 *
 * El acceso a este controlador ya está restringido a admin desde la ruta
 * (verificarToken + permitirRoles('admin')). Aquí solo se evita apilar
 * varias sentencias en una sola petición, para no abrir la puerta a
 * "SELECT 1; DROP TABLE ...".
 */

function tieneMultiplesSentencias(sql) {
  // Se tolera un ';' final (con o sin espacios después); si queda otro ';'
  // en medio del texto, se interpreta como varias sentencias apiladas.
  const limpio = sql.trim().replace(/;\s*$/, '');
  return limpio.includes(';');
}

async function ejecutar(req, res) {
  const { sql } = req.body;

  if (!sql || !sql.trim()) {
    return res.status(400).json({ mensaje: 'La consulta SQL no puede estar vacía' });
  }
  if (tieneMultiplesSentencias(sql)) {
    return res.status(400).json({ mensaje: 'Solo se permite ejecutar una sentencia SQL por vez' });
  }

  const inicio = Date.now();
  try {
    const [resultado, campos] = await pool.query(sql);
    const duracionMs = Date.now() - inicio;

    // SELECT / SHOW / DESCRIBE / EXPLAIN devuelven un arreglo de filas.
    // INSERT / UPDATE / DELETE / DDL devuelven un objeto ResultSetHeader.
    if (Array.isArray(resultado)) {
      const columnas = campos && campos.length > 0
        ? campos.map((c) => c.name)
        : (resultado[0] ? Object.keys(resultado[0]) : []);

      return res.json({
        tipo: 'filas',
        columnas,
        filas: resultado,
        totalFilas: resultado.length,
        duracionMs
      });
    }

    return res.json({
      tipo: 'resultado',
      mensaje: 'Consulta ejecutada correctamente',
      filasAfectadas: resultado.affectedRows ?? null,
      idInsertado: resultado.insertId || null,
      duracionMs
    });
  } catch (err) {
    console.error('Error en consola SQL admin:', err.message);
    res.status(400).json({ mensaje: err.sqlMessage || err.message || 'Error al ejecutar la consulta' });
  }
}

module.exports = { ejecutar };
