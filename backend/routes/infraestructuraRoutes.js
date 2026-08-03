const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const asyncHandler = require('../middlewares/asyncHandler');

// Público: ambientes (para la web y el formulario de reserva)
router.get('/ambientes', asyncHandler(async (req, res) => {
  const [filas] = await pool.query('SELECT * FROM ambiente ORDER BY nombre');
  res.json(filas);
}));

// Público: mesas (para elegir en el formulario de reserva)
router.get('/mesas', asyncHandler(async (req, res) => {
  const [filas] = await pool.query(
    `SELECT m.*, a.nombre AS ambiente FROM mesa m
     JOIN ambiente a ON a.id_ambiente = m.id_ambiente
     ORDER BY a.nombre, m.id_mesa`
  );
  res.json(filas);
}));

// Nota: el listado de personal ahora vive en /api/empleados
// (ver empleadoRoutes.js), que además soporta filtrar por estado
// (Pendiente/Activo/Rechazado/etc.) para el flujo de aprobación.

module.exports = router;
