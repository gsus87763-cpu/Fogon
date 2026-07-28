/**
 * Envío de correos transaccionales (por ahora, solo el de "recuperar
 * contraseña"). Si el .env trae credenciales SMTP, se envía el correo de
 * verdad con nodemailer; si no, se imprime el enlace en la consola del
 * backend para no bloquear el desarrollo/pruebas sin un proveedor de correo
 * configurado.
 */
require('dotenv').config();
const nodemailer = require('nodemailer');

function transporterDisponible() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

function crearTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
}

async function enviarCorreoRecuperacion({ correo, nombre, enlace }) {
  const asunto = 'Recupera tu contraseña — El Fogón';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color:#7a1f1f;">El Fogón</h2>
      <p>Hola ${nombre || ''},</p>
      <p>Recibimos una solicitud para restablecer tu contraseña. Este enlace es válido
      por 1 hora:</p>
      <p><a href="${enlace}" style="background:#7a1f1f;color:#fff;padding:10px 18px;
      border-radius:6px;text-decoration:none;display:inline-block;">Restablecer contraseña</a></p>
      <p>Si no solicitaste esto, puedes ignorar este correo.</p>
    </div>`;

  if (!transporterDisponible()) {
    // Sin SMTP configurado (modo desarrollo): se deja registrado en consola
    // para poder probar el flujo completo sin depender de un proveedor real.
    console.log('\n[mailer] SMTP no configurado — enlace de recuperación (solo consola):');
    console.log(`[mailer] Para: ${correo} -> ${enlace}\n`);
    return { enviado: false, modo: 'consola' };
  }

  const transporter = crearTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'El Fogón <no-responder@elfogon.com>',
    to: correo,
    subject: asunto,
    html
  });
  return { enviado: true, modo: 'smtp' };
}

module.exports = { enviarCorreoRecuperacion };
