const express = require('express');
const router = express.Router();
const consultaController = require('../controllers/consultaController');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

// Solo admin: esta consola ejecuta SQL crudo contra la BD.
router.use(verificarToken, permitirRoles('admin'));

router.post('/ejecutar', consultaController.ejecutar);

module.exports = router;
