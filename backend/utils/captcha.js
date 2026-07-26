const svgCaptcha = require('svg-captcha');
const crypto = require('crypto');

// Almacén en memoria: captchaId -> { texto, expira }
// Para producción real conviene mover esto a Redis, pero para el alcance
// académico de este proyecto un Map en memoria es suficiente.
const almacenCaptchas = new Map();
const TTL_MS = 5 * 60 * 1000; // 5 minutos

function limpiarExpirados() {
  const ahora = Date.now();
  for (const [id, valor] of almacenCaptchas) {
    if (valor.expira < ahora) almacenCaptchas.delete(id);
  }
}

function generarCaptcha() {
  limpiarExpirados();
  const captcha = svgCaptcha.create({
    size: 5,
    noise: 3,
    color: true,
    ignoreChars: '0oOlI1'
  });
  const captchaId = crypto.randomUUID();
  almacenCaptchas.set(captchaId, {
    texto: captcha.text.toLowerCase(),
    expira: Date.now() + TTL_MS
  });
  return { captchaId, svg: captcha.data };
}

function verificarCaptcha(captchaId, respuesta) {
  const registro = almacenCaptchas.get(captchaId);
  if (!registro) return false;
  almacenCaptchas.delete(captchaId); // un solo uso
  if (registro.expira < Date.now()) return false;
  return registro.texto === String(respuesta || '').toLowerCase().trim();
}

module.exports = { generarCaptcha, verificarCaptcha };
