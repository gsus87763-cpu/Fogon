const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { validarProducto } = require('../middlewares/validarProducto');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

// Público: carta digital (solo productos activos)
router.get('/', productoController.listar);
router.get('/:id', productoController.obtener);

// Gestión interna: admin y cocina pueden mantener la carta
router.post('/', verificarToken, permitirRoles('admin', 'cocina'), validarProducto, productoController.crear);
router.put('/:id', verificarToken, permitirRoles('admin', 'cocina'), validarProducto, productoController.actualizar);
router.delete('/:id', verificarToken, permitirRoles('admin', 'cocina'), productoController.eliminar);
router.patch('/:id/restaurar', verificarToken, permitirRoles('admin', 'cocina'), productoController.restaurar);

module.exports = router;
