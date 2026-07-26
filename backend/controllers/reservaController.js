const reservaModel = require('../models/reservaModel');

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

async function misReservas(req, res) {
  try {
    const idCliente = req.user.id_usuario ? await obtenerIdClienteDeUsuario(req.user) : null;
    if (!idCliente) return res.status(403).json({ mensaje: 'Solo disponible para clientes' });
    const reservas = await reservaModel.listarPorCliente(idCliente);
    res.json(reservas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al listar reservas' });
  }
}

// Helper: dado el usuario del token, resuelve su id_cliente real
const pool = require('../config/db');
async function obtenerIdClienteDeUsuario(user) {
  const [filas] = await pool.query('SELECT id_cliente FROM USUARIO WHERE id_usuario = ?', [user.id_usuario]);
  return filas[0]?.id_cliente || null;
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

    const idCliente = await obtenerIdClienteDeUsuario(req.user);
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
    const reserva = await reservaModel.cancelar(req.params.id);
    res.json(reserva);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al cancelar la reserva' });
  }
}

module.exports = { misReservas, listarTodas, crear, confirmar, cancelar };
