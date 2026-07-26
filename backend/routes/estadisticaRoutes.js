const express = require('express');
const router = express.Router();
const estadisticaController = require('../controllers/estadisticaController');
const reporteController = require('../controllers/reporteController');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

router.use(verificarToken, permitirRoles('admin', 'caja', 'salon'));

router.get('/reservas-por-dia', estadisticaController.reservasPorDia);
router.get('/ingresos-por-mes', estadisticaController.ingresosPorMes);
router.get('/reportes/reservas-pdf', reporteController.reservasPdf);

module.exports = router;
