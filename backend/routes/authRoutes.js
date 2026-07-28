const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middlewares/auth');
const { generarCaptcha } = require('../utils/captcha');

router.get('/captcha', (req, res) => res.json(generarCaptcha()));

router.post('/registro', authController.registro);
router.post('/login', authController.login);
router.post('/google', authController.loginGoogle);
router.post('/recuperar', authController.solicitarRecuperacion);
router.post('/restablecer', authController.restablecerPassword);
router.post('/logout', verificarToken, authController.logout);

module.exports = router;
