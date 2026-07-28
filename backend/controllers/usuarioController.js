const usuarioModel = require('../models/usuarioModel');

async function listar(req, res) {
  try {
    const incluirInactivos = req.query.incluirInactivos === 'true';
    const rol = req.query.rol || null;
    const usuarios = await usuarioModel.listar({ incluirInactivos, rol });
    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al listar usuarios' });
  }
}

async function roles(req, res) {
  try {
    res.json(await usuarioModel.listarRoles());
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al listar roles' });
  }
}

async function cambiarRol(req, res) {
  try {
    const { rol } = req.body;
    if (!rol) return res.status(400).json({ mensaje: 'Debe indicar el nuevo rol' });
    if (Number(req.params.id) === req.user.id_usuario) {
      return res.status(400).json({ mensaje: 'No puedes cambiar tu propio rol' });
    }
    const usuario = await usuarioModel.cambiarRol(req.params.id, rol);
    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(400).json({ mensaje: err.message || 'Error al cambiar el rol' });
  }
}

async function activar(req, res) {
  try {
    res.json(await usuarioModel.cambiarEstado(req.params.id, true));
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al activar el usuario' });
  }
}

async function desactivar(req, res) {
  try {
    if (Number(req.params.id) === req.user.id_usuario) {
      return res.status(400).json({ mensaje: 'No puedes desactivar tu propia cuenta' });
    }
    res.json(await usuarioModel.cambiarEstado(req.params.id, false));
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al desactivar el usuario' });
  }
}

module.exports = { listar, roles, cambiarRol, activar, desactivar };
