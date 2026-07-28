require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verifica el ID token que envía el botón "Continuar con Google" del
 * frontend (Google Identity Services). Lanza un error si el token no es
 * válido o no corresponde a este cliente de Google.
 *
 * Devuelve { googleId, correo, correoVerificado, nombre, apellidos }
 */
async function verificarIdTokenGoogle(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  const payload = ticket.getPayload();
  if (!payload) throw new Error('Token de Google inválido');

  return {
    googleId: payload.sub,
    correo: payload.email,
    correoVerificado: payload.email_verified,
    nombre: payload.given_name || payload.name || 'Cliente',
    apellidos: payload.family_name || ''
  };
}

module.exports = { verificarIdTokenGoogle };
