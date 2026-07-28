const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

router.use(verificarToken, permitirRoles('admin'));

router.get('/', usuarioController.listar);
router.get('/roles', usuarioController.roles);
router.patch('/:id/rol', usuarioController.cambiarRol);
router.patch('/:id/activar', usuarioController.activar);
router.patch('/:id/desactivar', usuarioController.desactivar);

module.exports = router;
