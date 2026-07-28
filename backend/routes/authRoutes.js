const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middlewares/auth');

<<<<<<< HEAD
router.get('/captcha', authController.obtenerCaptcha);
=======
>>>>>>> a8ece06d7bda7dd5174b157bf6a288520c5275dd
router.post('/registro', authController.registro);
router.post('/login', authController.login);
router.post('/google', authController.loginGoogle);
router.post('/recuperar', authController.solicitarRecuperacion);
router.post('/restablecer', authController.restablecerPassword);
router.post('/logout', verificarToken, authController.logout);

module.exports = router;
