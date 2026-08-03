/**
 * Envío de correos transaccionales. Si el .env trae credenciales SMTP, se
 * envía el correo de verdad con nodemailer; si no, se imprime en la
 * consola del backend para no bloquear el desarrollo/pruebas sin un
 * proveedor de correo configurado.
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

// Envío genérico: todas las plantillas de abajo pasan por acá. En modo
// desarrollo (sin SMTP configurado) solo lo deja en consola, para poder
// probar el flujo completo sin depender de un proveedor real.
async function enviarCorreo({ to, subject, html }) {
  if (!to) return { enviado: false, modo: 'sin-destinatario' };

  if (!transporterDisponible()) {
    console.log(`\n[mailer] SMTP no configurado — correo solo en consola ("${subject}"):`);
    console.log(`[mailer] Para: ${to}\n`);
    return { enviado: false, modo: 'consola' };
  }

  const transporter = crearTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'El Fogón <no-responder@elfogon.com>',
    to, subject, html
  });
  return { enviado: true, modo: 'smtp' };
}

function plantilla(tituloInterno, cuerpoHtml) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color:#7a1f1f;">El Fogón</h2>
      ${cuerpoHtml}
    </div>`;
}

async function enviarCorreoRecuperacion({ correo, nombre, enlace }) {
  const html = plantilla('Recuperar contraseña', `
    <p>Hola ${nombre || ''},</p>
    <p>Recibimos una solicitud para restablecer tu contraseña. Este enlace es válido
    por 1 hora:</p>
    <p><a href="${enlace}" style="background:#7a1f1f;color:#fff;padding:10px 18px;
    border-radius:6px;text-decoration:none;display:inline-block;">Restablecer contraseña</a></p>
    <p>Si no solicitaste esto, puedes ignorar este correo.</p>`);
  return enviarCorreo({ to: correo, subject: 'Recupera tu contraseña — El Fogón', html });
}

// Se envía al cliente cuando caja/salón/admin aprueba el pago de su
// reserva (queda CONFIRMADA / activa).
async function enviarCorreoPagoAprobado({ correo, nombre, reserva }) {
  const html = plantilla('Pago aprobado', `
    <p>Hola ${nombre || ''},</p>
    <p>Tu pago fue verificado y tu reserva ya está <strong>confirmada y activa</strong>. Te esperamos:</p>
    <ul>
      <li><strong>Fecha:</strong> ${reserva.fecha}</li>
      <li><strong>Hora:</strong> ${reserva.hora}</li>
      <li><strong>Mesa:</strong> N.º ${reserva.numero_mesa} (${reserva.ambiente})</li>
      <li><strong>Personas:</strong> ${reserva.cantidad_personas}</li>
    </ul>
    <p>¡Gracias por elegir El Fogón!</p>`);
  return enviarCorreo({ to: correo, subject: 'Tu pago fue aprobado — reserva confirmada', html });
}

// Se envía al cliente si su pago es rechazado, para que reintente.
async function enviarCorreoPagoRechazado({ correo, nombre, reserva, motivo }) {
  const html = plantilla('Pago rechazado', `
    <p>Hola ${nombre || ''},</p>
    <p>No pudimos verificar el pago de tu reserva del ${reserva.fecha} a las ${reserva.hora}.
    ${motivo ? `Motivo: ${motivo}.` : ''}</p>
    <p>Puedes generar un nuevo QR de pago desde "Mis reservas" para volver a intentarlo.</p>`);
  return enviarCorreo({ to: correo, subject: 'No pudimos confirmar tu pago — El Fogón', html });
}

// Aviso a administración/RRHH cuando alguien se registra como empleado y
// queda pendiente de aprobación.
async function enviarCorreoNuevaSolicitudEmpleado({ correoAdmin, nombreSolicitante }) {
  if (!correoAdmin) return { enviado: false, modo: 'sin-destinatario' };
  const html = plantilla('Nueva solicitud de empleo', `
    <p><strong>${nombreSolicitante}</strong> se registró como personal y está esperando aprobación
    para poder trabajar en el sistema.</p>
    <p>Revísalo desde el panel de "Solicitudes de personal".</p>`);
  return enviarCorreo({ to: correoAdmin, subject: 'Nueva solicitud de personal — El Fogón', html });
}

// Se envía al empleado cuando su solicitud de registro es aprobada.
async function enviarCorreoEmpleadoAprobado({ correo, nombre }) {
  const html = plantilla('Solicitud aprobada', `
    <p>Hola ${nombre || ''},</p>
    <p>Tu solicitud para trabajar en El Fogón fue <strong>aprobada</strong>. Ya puedes iniciar
    sesión con tu correo y contraseña.</p>`);
  return enviarCorreo({ to: correo, subject: 'Tu cuenta de personal fue aprobada — El Fogón', html });
}

// Se envía al empleado cuando su solicitud de registro es rechazada.
async function enviarCorreoEmpleadoRechazado({ correo, nombre, motivo }) {
  const html = plantilla('Solicitud rechazada', `
    <p>Hola ${nombre || ''},</p>
    <p>Tu solicitud para trabajar en El Fogón no fue aprobada.
    ${motivo ? `Motivo: ${motivo}.` : ''}</p>
    <p>Si crees que esto es un error, contacta a administración.</p>`);
  return enviarCorreo({ to: correo, subject: 'Sobre tu solicitud de personal — El Fogón', html });
}

module.exports = {
  enviarCorreoRecuperacion, enviarCorreoPagoAprobado, enviarCorreoPagoRechazado,
  enviarCorreoNuevaSolicitudEmpleado, enviarCorreoEmpleadoAprobado, enviarCorreoEmpleadoRechazado
};
