const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

router.use(verificarToken);

router.get('/mias', reservaController.misReservas);
router.post('/', reservaController.crear);
router.patch('/:id/cancelar', reservaController.cancelar);

router.get('/:id/pago', reservaController.obtenerPago);
router.get('/:id/pago/comprobante', reservaController.comprobantePago);
router.post('/:id/pago/regenerar', reservaController.regenerarPago);
router.post('/:id/pago/resolver', permitirRoles('admin', 'salon', 'caja'), reservaController.resolverPago);

router.get('/', permitirRoles('admin', 'salon'), reservaController.listarTodas);
router.patch('/:id/confirmar', permitirRoles('admin', 'salon'), reservaController.confirmar);

module.exports = router;
