const empleadoModel = require('../models/empleadoModel');
const { enviarCorreoEmpleadoAprobado, enviarCorreoEmpleadoRechazado } = require('../utils/mailer');

const ROLES_VALIDOS = ['staff', 'admin', 'cocina', 'salon', 'caja', 'almacen', 'rrhh'];

// GET /api/empleados?estado=Pendiente  (por defecto, solo pendientes)
async function listar(req, res) {
  try {
    const estado = req.query.estado === 'todos' ? null : (req.query.estado || 'Pendiente');
    const empleados = await empleadoModel.listar({ estado });
    res.json(empleados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al listar el personal' });
  }
}

// PATCH /api/empleados/:id/aprobar  { rol }
// rol es opcional: 'staff' (por defecto), 'admin', 'cocina', 'salon'
// (agente que atiende mesas/reservas), 'caja', 'almacen' o 'rrhh'.
async function aprobar(req, res) {
  try {
    const rol = req.body.rol || 'staff';
    if (!ROLES_VALIDOS.includes(rol)) {
      return res.status(400).json({ mensaje: `Rol inválido. Debe ser uno de: ${ROLES_VALIDOS.join(', ')}` });
    }
    const existente = await empleadoModel.obtenerPorId(req.params.id);
    if (!existente) return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    if (existente.estado !== 'Pendiente') {
      return res.status(409).json({ mensaje: 'Esta solicitud ya fue procesada' });
    }

    const empleado = await empleadoModel.aprobar(req.params.id, rol);
    enviarCorreoEmpleadoAprobado({ correo: empleado.correo_electronico, nombre: empleado.nombre })
      .catch((err) => console.error('No se pudo enviar el correo de aprobación:', err.message));

    res.json(empleado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al aprobar la solicitud' });
  }
}

// PATCH /api/empleados/:id/rechazar  { motivo }
async function rechazar(req, res) {
  try {
    const existente = await empleadoModel.obtenerPorId(req.params.id);
    if (!existente) return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    if (existente.estado !== 'Pendiente') {
      return res.status(409).json({ mensaje: 'Esta solicitud ya fue procesada' });
    }

    const empleado = await empleadoModel.rechazar(req.params.id, req.body.motivo);
    enviarCorreoEmpleadoRechazado({
      correo: empleado.correo_electronico, nombre: empleado.nombre, motivo: req.body.motivo
    }).catch((err) => console.error('No se pudo enviar el correo de rechazo:', err.message));

    res.json(empleado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al rechazar la solicitud' });
  }
}

module.exports = { listar, aprobar, rechazar };
