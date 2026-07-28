const clienteModel = require('../models/clienteModel');

function validarDatosCliente({ nombre, apellidos, correo }) {
  const errores = [];
  if (!nombre || nombre.trim().length < 2) errores.push('El nombre debe tener al menos 2 caracteres');
  if (!apellidos || apellidos.trim().length < 2) errores.push('Los apellidos deben tener al menos 2 caracteres');
  if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) errores.push('El correo no tiene un formato válido');
  return errores;
}

async function listar(req, res) {
  try {
    const incluirInactivos = req.query.incluirInactivos === 'true';
    const busqueda = req.query.busqueda || null;
    const clientes = await clienteModel.listar({ incluirInactivos, busqueda });
    res.json(clientes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al listar clientes' });
  }
}

async function obtener(req, res) {
  try {
    const cliente = await clienteModel.obtenerPorId(req.params.id);
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener el cliente' });
  }
}

async function crear(req, res) {
  try {
    const errores = validarDatosCliente(req.body);
    if (errores.length > 0) return res.status(400).json({ mensaje: 'Datos inválidos', errores });

    if (req.body.correo) {
      const existente = await clienteModel.obtenerPorCorreo(req.body.correo);
      if (existente) return res.status(409).json({ mensaje: 'Ya existe un cliente con ese correo' });
    }

    const cliente = await clienteModel.crear(req.body);
    res.status(201).json(cliente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al crear el cliente' });
  }
}

async function actualizar(req, res) {
  try {
    const existente = await clienteModel.obtenerPorId(req.params.id);
    if (!existente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });

    const errores = validarDatosCliente(req.body);
    if (errores.length > 0) return res.status(400).json({ mensaje: 'Datos inválidos', errores });

    const cliente = await clienteModel.actualizar(req.params.id, req.body);
    res.json(cliente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al actualizar el cliente' });
  }
}

// DELETE lógico: nunca borra la fila, solo marca activo = 0
async function eliminar(req, res) {
  try {
    const existente = await clienteModel.obtenerPorId(req.params.id);
    if (!existente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    const cliente = await clienteModel.eliminarLogico(req.params.id);
    res.json({ mensaje: 'Cliente desactivado (eliminación lógica)', cliente });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al eliminar el cliente' });
  }
}

async function restaurar(req, res) {
  try {
    const cliente = await clienteModel.restaurar(req.params.id);
    res.json({ mensaje: 'Cliente reactivado', cliente });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al restaurar el cliente' });
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar, restaurar };
