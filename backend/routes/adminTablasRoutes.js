const express = require('express');
const router = express.Router();
const crudController = require('../controllers/crudController');
const { verificarToken } = require('../middlewares/auth');

router.use(verificarToken);

// Le dice al frontend qué tablas/acciones puede usar el usuario logueado
router.get('/', crudController.tablasDisponibles);

router.get('/:tabla/exportar/excel', crudController.exportarExcel);
router.get('/:tabla/exportar/pdf', crudController.exportarPdf);

router.get('/:tabla', crudController.listar);
router.get('/:tabla/:id', crudController.obtener);
router.post('/:tabla', crudController.crear);
router.put('/:tabla/:id', crudController.actualizar);
router.delete('/:tabla/:id', crudController.eliminar);

module.exports = router;
