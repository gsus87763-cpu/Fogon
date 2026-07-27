const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

// Control total de clientes: solo el administrador
router.use(verificarToken, permitirRoles('admin'));

router.get('/', clienteController.listar);
router.get('/:id', clienteController.obtener);
router.post('/', clienteController.crear);
router.put('/:id', clienteController.actualizar);
router.delete('/:id', clienteController.eliminar);
router.patch('/:id/restaurar', clienteController.restaurar);

module.exports = router;
