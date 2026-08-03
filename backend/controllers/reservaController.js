const PDFDocument = require('pdfkit');
const reservaModel = require('../models/reservaModel');
const financeModel = require('../models/financeModel');
const { construirPayloadQR, verificarFirmaPayload, generarImagenQR } = require('../utils/qrPago');
const { enviarCorreoPagoAprobado, enviarCorreoPagoRechazado } = require('../utils/mailer');

function validarDatosReserva({ id_mesa, fecha, hora, cantidad_personas }) {
  const errores = [];
  if (!id_mesa) errores.push('Debe seleccionar una mesa');
  if (!fecha || isNaN(Date.parse(fecha))) errores.push('Fecha inválida');
  if (!hora || !/^\d{2}:\d{2}(:\d{2})?$/.test(hora)) errores.push('Hora inválida (HH:MM)');
  if (!cantidad_personas || cantidad_personas <= 0) errores.push('La cantidad de personas debe ser mayor a 0');
  if (fecha && new Date(fecha) < new Date(new Date().toDateString())) {
    errores.push('No se puede reservar en una fecha pasada');
  }
  return errores;
}

// El JWT (ver authController.firmarToken) ya trae tipo_cuenta/id_cuenta;
// no existe ninguna tabla USUARIO en este esquema.
function idClienteDelToken(user) {
  return user && user.tipo_cuenta === 'CLIENTE' ? user.id_cuenta : null;
}

async function misReservas(req, res) {
  try {
    const idCliente = idClienteDelToken(req.user);
    if (!idCliente) return res.status(403).json({ mensaje: 'Solo disponible para clientes' });
    const reservas = await reservaModel.listarPorCliente(idCliente);
    res.json(reservas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al listar reservas' });
  }
}

async function listarTodas(req, res) {
  try {
    const { fecha, estado } = req.query;
    const reservas = await reservaModel.listarTodas({ fecha, estado });
    res.json(reservas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al listar reservas' });
  }
}

async function crear(req, res) {
  try {
    const errores = validarDatosReserva(req.body);
    if (errores.length > 0) return res.status(400).json({ mensaje: 'Datos inválidos', errores });

    const idCliente = idClienteDelToken(req.user);
    if (!idCliente) return res.status(403).json({ mensaje: 'Solo los clientes pueden reservar' });

    const choque = await reservaModel.existeChoque(req.body);
    if (choque) {
      return res.status(409).json({ mensaje: 'Esa mesa ya está reservada en ese horario' });
    }

    const platos = Array.isArray(req.body.platos)
      ? req.body.platos.filter((p) => p && p.id_producto && p.cantidad > 0)
      : [];

    const reserva = await reservaModel.crear({ ...req.body, id_cliente: idCliente, platos });
    res.status(201).json(reserva);
  } catch (err) {
    if (err.message && err.message.includes('Cupo diario')) {
      return res.status(409).json({ mensaje: err.message });
    }
    if (err.message && err.message.includes('ya no está disponible')) {
      return res.status(409).json({ mensaje: err.message });
    }
    console.error(err);
    res.status(500).json({ mensaje: 'Error al crear la reserva' });
  }
}

async function confirmar(req, res) {
  try {
    const reserva = await reservaModel.cambiarEstado(req.params.id, 'CONFIRMADA');
    res.json(reserva);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al confirmar la reserva' });
  }
}

async function cancelar(req, res) {
  try {
    const existente = await reservaModel.obtenerPorId(req.params.id);
    if (!existente) return res.status(404).json({ mensaje: 'Reserva no encontrada' });

    // Un cliente solo puede cancelar sus propias reservas; el personal
    // (admin/salon) puede cancelar cualquiera.
    const idCliente = idClienteDelToken(req.user);
    const esPersonalAutorizado = ['admin', 'salon'].includes(req.user.rol);
    if (idCliente && existente.id_cliente !== idCliente && !esPersonalAutorizado) {
      return res.status(403).json({ mensaje: 'No puedes cancelar la reserva de otro cliente' });
    }

    const reserva = await reservaModel.cancelar(req.params.id);
    res.json(reserva);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al cancelar la reserva' });
  }
}

const ROLES_CAJA = ['admin', 'salon', 'caja'];

function puedeVerReserva(req, reserva) {
  const idCliente = idClienteDelToken(req.user);
  if (idCliente && reserva.id_cliente === idCliente) return true;
  return ROLES_CAJA.includes(req.user.rol);
}

// GET /api/reservas/:id/pago -> estado actual del cobro (para refrescar
// el panel del cliente o del cajero sin tener que descargar el PDF).
async function obtenerPago(req, res) {
  try {
    const reserva = await reservaModel.obtenerPorId(req.params.id);
    if (!reserva) return res.status(404).json({ mensaje: 'Reserva no encontrada' });
    if (!puedeVerReserva(req, reserva)) return res.status(403).json({ mensaje: 'No tienes acceso a esta reserva' });

    const pago = await reservaModel.obtenerPagoVigente(req.params.id);
    res.json(pago);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al consultar el pago' });
  }
}

// POST /api/reservas/:id/pago/regenerar -> genera un QR nuevo (por
// ejemplo si el anterior expiró o fue rechazado). Solo el dueño de la
// reserva o el personal de caja/salón/admin puede pedirlo.
async function regenerarPago(req, res) {
  try {
    const reserva = await reservaModel.obtenerPorId(req.params.id);
    if (!reserva) return res.status(404).json({ mensaje: 'Reserva no encontrada' });
    if (!puedeVerReserva(req, reserva)) return res.status(403).json({ mensaje: 'No tienes acceso a esta reserva' });
    if (reserva.estado !== 'PENDIENTE') {
      return res.status(409).json({ mensaje: 'Esta reserva ya no está pendiente de pago' });
    }

    const platos = await reservaModel.obtenerPlatosDeReserva(req.params.id);
    const monto = reservaModel.calcularMontoReserva(platos, reserva.cantidad_personas);
    const pago = await reservaModel.crearPagoQR(req.params.id, monto);
    res.status(201).json(pago);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al generar el nuevo QR de pago' });
  }
}

// GET /api/reservas/:id/pago/comprobante -> PDF con el detalle de la
// reserva y el QR de pago, para que el cliente lo muestre o lo enseñe
// al momento de pagar (día, hora, mesa, monto, código).
async function comprobantePago(req, res) {
  try {
    const reserva = await reservaModel.obtenerDetallado(req.params.id);
    if (!reserva) return res.status(404).json({ mensaje: 'Reserva no encontrada' });
    if (!puedeVerReserva(req, reserva)) return res.status(403).json({ mensaje: 'No tienes acceso a esta reserva' });

    const pago = await reservaModel.obtenerPagoVigente(req.params.id);
    if (!pago) return res.status(404).json({ mensaje: 'Esta reserva todavía no tiene un cobro generado' });

    const contenidoQR = construirPayloadQR({ codigo: pago.codigo, monto: pago.monto, reserva });
    const imagenQR = await generarImagenQR(contenidoQR);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="comprobante_reserva_${reserva.id_reserva}.pdf"`);
    doc.pipe(res);

    doc.fontSize(22).fillColor('#5c1a1a').text('EL FOGÓN', { align: 'center' });
    doc.fontSize(13).fillColor('#333').text('Comprobante de pago de reserva', { align: 'center' });
    doc.moveDown(1);

    const filaEstado = pago.estado === 'APROBADO' ? 'PAGADO'
      : pago.estado === 'RECHAZADO' ? 'RECHAZADO' : 'PENDIENTE DE PAGO';
    doc.fontSize(11).fillColor('#000');
    const detalles = [
      ['Cliente', reserva.cliente],
      ['Fecha de la reserva', reserva.fecha],
      ['Hora', reserva.hora],
      ['Ambiente', reserva.ambiente],
      ['Mesa', `N.º ${reserva.numero_mesa}`],
      ['Cantidad de personas', String(reserva.cantidad_personas)],
      ['Código de pago', pago.codigo],
      ['Monto a pagar', `Bs ${Number(pago.monto).toFixed(2)}`],
      ['Estado del pago', filaEstado],
      ['Válido hasta', new Date(pago.fecha_expiracion).toLocaleString('es-BO')]
    ];
    detalles.forEach(([etiqueta, valor]) => {
      doc.font('Helvetica-Bold').text(`${etiqueta}: `, { continued: true }).font('Helvetica').text(String(valor ?? '-'));
    });

    doc.moveDown(1);
    doc.fontSize(10).fillColor('#666').text(
      'Escanea este código QR con tu app bancaria o muéstralo en caja para completar el pago. ' +
      'Tu reserva quedará activa apenas el pago sea aprobado.',
      { width: 470 }
    );
    doc.moveDown(0.5);
    const xQR = (doc.page.width - 200) / 2;
    doc.image(imagenQR, xQR, doc.y, { width: 200, height: 200 });
    doc.moveDown(15);
    doc.fontSize(9).fillColor('#999').text('Este comprobante es de uso académico y no reemplaza un comprobante bancario oficial.', { align: 'center' });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al generar el comprobante de pago' });
  }
}

// POST /api/reservas/:id/pago/resolver { codigo, aprobar, observacion }
// Lo usa el personal de caja/salón/admin al verificar el QR (leyéndolo o
// tecleando el código). Aprobar deja la reserva CONFIRMADA (activa) y
// genera su factura; rechazar la deja pendiente para que el cliente
// pueda reintentar el pago.
async function resolverPago(req, res) {
  try {
    const { codigo, aprobar, observacion } = req.body;
    if (typeof aprobar !== 'boolean') {
      return res.status(400).json({ mensaje: 'Indica si el pago se aprueba o se rechaza' });
    }

    const pago = await reservaModel.obtenerPagoVigente(req.params.id);
    if (!pago) return res.status(404).json({ mensaje: 'Esta reserva no tiene un cobro pendiente' });
    if (!codigo || codigo.trim().toUpperCase() !== pago.codigo) {
      return res.status(400).json({ mensaje: 'El código no coincide con el QR de esta reserva' });
    }

    const idEmpleado = req.user.tipo_cuenta === 'EMPLEADO' ? req.user.id_cuenta : null;
    const resultado = await reservaModel.resolverPago(pago.id_pago, { aprobar, id_empleado: idEmpleado, observacion });

    const reservaDetallada = await reservaModel.obtenerDetallado(req.params.id);
    if (aprobar) {
      enviarCorreoPagoAprobado({ correo: reservaDetallada?.correo, nombre: reservaDetallada?.cliente, reserva: reservaDetallada })
        .catch((err) => console.error('No se pudo enviar el correo de pago aprobado:', err.message));
    } else {
      enviarCorreoPagoRechazado({ correo: reservaDetallada?.correo, nombre: reservaDetallada?.cliente, reserva: reservaDetallada, motivo: observacion })
        .catch((err) => console.error('No se pudo enviar el correo de pago rechazado:', err.message));
    }

    if (aprobar) {
      try {
        await financeModel.generarFactura({ id_reserva: req.params.id, metodo_pago: 'QR' });
      } catch (errFactura) {
        // No revertimos la aprobación del pago por esto: la reserva ya
        // quedó activa, que es lo importante para el cliente. Solo se
        // registra para que el admin revise la facturación manualmente.
        console.error('El pago se aprobó pero no se pudo generar la factura automáticamente:', errFactura.message);
      }
    }

    res.json(resultado);
  } catch (err) {
    if (err.message && (err.message.includes('ya fue procesado') || err.message.includes('expiró'))) {
      return res.status(409).json({ mensaje: err.message });
    }
    console.error(err);
    res.status(500).json({ mensaje: 'Error al procesar el pago' });
  }
}

module.exports = {
  misReservas, listarTodas, crear, confirmar, cancelar,
  obtenerPago, regenerarPago, comprobantePago, resolverPago
};
