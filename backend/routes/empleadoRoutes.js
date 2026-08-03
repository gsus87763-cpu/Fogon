const express = require('express');
const router = express.Router();
const empleadoController = require('../controllers/empleadoController');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

router.use(verificarToken, permitirRoles('admin'));

router.get('/', empleadoController.listar);
router.patch('/:id/aprobar', empleadoController.aprobar);
router.patch('/:id/rechazar', empleadoController.rechazar);

module.exports = router;
