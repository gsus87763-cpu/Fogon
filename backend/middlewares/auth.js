const jwt = require('jsonwebtoken');

/**
 * Verifica que la petición traiga un JWT válido en el header Authorization.
 * Adjunta el payload decodificado (id_usuario, id_rol, rol, nombre) a req.user.
 */
function verificarToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
}

/**
 * Restringe el acceso a una ruta a un conjunto de roles.
 * Uso: permitirRoles('admin', 'salon')
 */
function permitirRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ mensaje: 'No tiene permisos para esta acción' });
    }
    next();
  };
}

module.exports = { verificarToken, permitirRoles };
