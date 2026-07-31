const crypto = require('crypto');
const QRCode = require('qrcode');

// Genera un código de pago corto y legible (para que el cajero también
// pueda teclearlo si el lector de QR falla), con un prefijo fijo para
// distinguirlo a simple vista de otros códigos del sistema (ej. tokens).
function generarCodigoPago() {
  const aleatorio = crypto.randomBytes(5).toString('hex').toUpperCase();
  return `FOGON-${aleatorio}`;
}

// Firma el contenido del QR con HMAC (usando el mismo JWT_SECRET del
// proyecto) para que el personal pueda verificar, con el propio backend,
// que el QR no fue adulterado antes de aprobar el pago.
function firmar(texto) {
  return crypto.createHmac('sha256', process.env.JWT_SECRET || 'el-fogon-secret')
    .update(texto)
    .digest('hex')
    .slice(0, 16);
}

// Arma el contenido que se codifica en el QR: todos los datos de la
// reserva (fecha, hora, mesa, monto, etc.) más el código de pago y una
// firma corta. Es el "comprobante" que el cliente muestra o descarga.
function construirPayloadQR({ codigo, monto, reserva }) {
  const datos = {
    tipo: 'PAGO_RESERVA',
    codigo,
    monto: Number(monto).toFixed(2),
    moneda: 'BOB',
    restaurante: 'El Fogón',
    id_reserva: reserva.id_reserva,
    cliente: reserva.cliente || undefined,
    fecha: reserva.fecha,
    hora: reserva.hora,
    mesa: reserva.numero_mesa,
    ambiente: reserva.ambiente,
    personas: reserva.cantidad_personas
  };
  const texto = JSON.stringify(datos);
  const firma = firmar(texto);
  return JSON.stringify({ ...datos, firma });
}

// Verifica que el payload leído de un QR corresponda al código indicado
// y no haya sido modificado (compara la firma).
function verificarFirmaPayload(payloadTexto) {
  try {
    const datos = JSON.parse(payloadTexto);
    const { firma, ...resto } = datos;
    return firma === firmar(JSON.stringify(resto));
  } catch {
    return false;
  }
}

// Genera el QR como PNG en un buffer, listo para insertar en el PDF.
async function generarImagenQR(contenido) {
  return QRCode.toBuffer(contenido, { type: 'png', width: 260, margin: 1 });
}

module.exports = { generarCodigoPago, construirPayloadQR, verificarFirmaPayload, generarImagenQR };
