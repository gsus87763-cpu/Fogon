const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

router.use(verificarToken);

// Pago Empleado y Facturas: administración y caja
router.get('/pagos-empleado', permitirRoles('admin', 'caja', 'rrhh'), financeController.listarPagos);
router.post('/pagos-empleado', permitirRoles('admin', 'rrhh'), financeController.registrarPago);
router.patch('/pagos-empleado/:id/anular', permitirRoles('admin'), financeController.anularPago);

router.get('/facturas', permitirRoles('admin', 'caja'), financeController.listarFacturas);
router.post('/facturas', permitirRoles('admin', 'caja'), financeController.generarFactura);
router.patch('/facturas/:id/anular', permitirRoles('admin'), financeController.anularFactura);

// Detalle de compra: administración y almacén
router.get('/compras', permitirRoles('admin', 'almacen'), financeController.listarCompras);
router.post('/compras', permitirRoles('admin', 'almacen'), financeController.crearCompra);
router.post('/compras/:id/items', permitirRoles('admin', 'almacen'), financeController.agregarItem);
router.delete('/compras/:id/items/:idItem', permitirRoles('admin', 'almacen'), financeController.eliminarItem);

router.get('/resumen', permitirRoles('admin', 'caja'), financeController.resumen);

module.exports = router;
