const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middlewares/auth');

router.get('/captcha', authController.obtenerCaptcha);
router.post('/password-strength', authController.chequearFortaleza);
router.post('/registro', authController.registro);
router.post('/login', authController.login);
router.post('/logout', verificarToken, authController.logout);

module.exports = router;
