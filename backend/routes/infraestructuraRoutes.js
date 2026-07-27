const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const asyncHandler = require('../middlewares/asyncHandler');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

// Público: ambientes activos
router.get('/ambientes', asyncHandler(async (req, res) => {
  const [filas] = await pool.query('SELECT * FROM AMBIENTE ORDER BY nombre');
  res.json(filas);
}));

// Público: mesas disponibles (para elegir en el formulario de reserva)
router.get('/mesas', asyncHandler(async (req, res) => {
  const [filas] = await pool.query(
    `SELECT m.*, a.nombre AS ambiente FROM MESA m
     JOIN AMBIENTE a ON a.id_ambiente = m.id_ambiente
     WHERE m.activo = 1 ORDER BY a.nombre, m.numero`
  );
  res.json(filas);
}));

// Interno: empleados (RRHH / admin)
router.get('/empleados', verificarToken, permitirRoles('admin', 'rrhh'), asyncHandler(async (req, res) => {
  const [filas] = await pool.query('SELECT * FROM EMPLEADO WHERE activo = 1 ORDER BY apellidos');
  res.json(filas);
}));

// Interno: ingredientes (almacén / cocina)
router.get('/ingredientes', verificarToken, permitirRoles('admin', 'almacen', 'cocina'), asyncHandler(async (req, res) => {
  const [filas] = await pool.query('SELECT * FROM INGREDIENTE WHERE activo = 1 ORDER BY nombre');
  res.json(filas);
}));

module.exports = router;
