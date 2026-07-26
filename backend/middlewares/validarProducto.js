const CATEGORIAS_VALIDAS = ['Entrada', 'Plato Fuerte', 'Postre', 'Bebida', 'Adicional'];

function validarProducto(req, res, next) {
  const { nombre, categoria, precio, id_carta } = req.body;
  const errores = [];

  if (!id_carta) errores.push('id_carta es obligatorio');
  if (!nombre || nombre.trim().length < 2) errores.push('El nombre debe tener al menos 2 caracteres');
  if (!categoria || !CATEGORIAS_VALIDAS.includes(categoria)) {
    errores.push(`La categoría debe ser una de: ${CATEGORIAS_VALIDAS.join(', ')}`);
  }
  if (precio === undefined || precio === null || isNaN(precio) || Number(precio) <= 0) {
    errores.push('El precio debe ser un número mayor a 0');
  }

  if (errores.length > 0) {
    return res.status(400).json({ mensaje: 'Datos inválidos', errores });
  }
  next();
}

module.exports = { validarProducto, CATEGORIAS_VALIDAS };
