const productoModel = require('../models/productoModel');

// GET /api/productos?incluirInactivos=true&categoria=Postre
async function listar(req, res) {
  try {
    const incluirInactivos = req.query.incluirInactivos === 'true';
    const categoria = req.query.categoria || null;
    const productos = await productoModel.listar({ incluirInactivos, categoria });
    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al listar productos' });
  }
}

async function obtener(req, res) {
  try {
    const producto = await productoModel.obtenerPorId(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener el producto' });
  }
}

async function crear(req, res) {
  try {
    const producto = await productoModel.crear(req.body);
    res.status(201).json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al crear el producto' });
  }
}

async function actualizar(req, res) {
  try {
    const existente = await productoModel.obtenerPorId(req.params.id);
    if (!existente) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    const producto = await productoModel.actualizar(req.params.id, req.body);
    res.json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al actualizar el producto' });
  }
}

// DELETE lógico: nunca borra la fila, solo marca estado = 0
async function eliminar(req, res) {
  try {
    const existente = await productoModel.obtenerPorId(req.params.id);
    if (!existente) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    const producto = await productoModel.eliminarLogico(req.params.id);
    res.json({ mensaje: 'Producto desactivado (eliminación lógica)', producto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al eliminar el producto' });
  }
}

async function restaurar(req, res) {
  try {
    const producto = await productoModel.restaurar(req.params.id);
    res.json({ mensaje: 'Producto reactivado', producto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al restaurar el producto' });
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar, restaurar };
