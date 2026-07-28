const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const asyncHandler = require('../middlewares/asyncHandler');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

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

// Interno: empleados (RRHH / admin)
router.get('/empleados', verificarToken, permitirRoles('admin'), asyncHandler(async (req, res) => {
  const [filas] = await pool.query("SELECT * FROM empleado WHERE estado <> 'Inactivo' OR estado IS NULL ORDER BY apellidos");
  res.json(filas);
}));

module.exports = router;
