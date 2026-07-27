const express = require('express');
const router = express.Router();
const estadisticaController = require('../controllers/estadisticaController');
const reporteController = require('../controllers/reporteController');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

router.use(verificarToken);

// Gráficos: visibles para admin, caja y salón (como antes)
router.get('/reservas-por-dia', permitirRoles('admin', 'caja', 'salon'), estadisticaController.reservasPorDia);
router.get('/ingresos-por-mes', permitirRoles('admin', 'caja', 'salon'), estadisticaController.ingresosPorMes);

// Reporte PDF de reservas: admin, caja y salón (ya existía)
router.get('/reportes/reservas-pdf', permitirRoles('admin', 'caja', 'salon'), reporteController.reservasPdf);

// Exportaciones a Excel y reportes de clientes/finanzas: SOLO administrador
router.get('/reportes/reservas-excel', permitirRoles('admin'), reporteController.reservasExcel);
router.get('/reportes/clientes-pdf', permitirRoles('admin'), reporteController.clientesPdf);
router.get('/reportes/clientes-excel', permitirRoles('admin'), reporteController.clientesExcel);
router.get('/reportes/finanzas-pdf', permitirRoles('admin'), reporteController.finanzasPdf);
router.get('/reportes/finanzas-excel', permitirRoles('admin'), reporteController.finanzasExcel);

module.exports = router;
