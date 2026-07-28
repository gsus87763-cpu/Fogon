const pool = require('../config/db');

async function listar({ incluirInactivos = false, rol = null } = {}) {
  let sql = `SELECT u.id_usuario, u.correo, u.proveedor, u.activo, u.fecha_creacion,
                    r.nombre AS rol, u.id_empleado, u.id_cliente,
                    COALESCE(e.nombre, c.nombre) AS nombre,
                    COALESCE(e.apellidos, c.apellidos) AS apellidos
             FROM USUARIO u
             JOIN ROL r ON r.id_rol = u.id_rol
             LEFT JOIN EMPLEADO e ON e.id_empleado = u.id_empleado
             LEFT JOIN CLIENTE c ON c.id_cliente = u.id_cliente
             WHERE 1=1`;
  const params = [];
  if (!incluirInactivos) sql += ' AND u.activo = 1';
  if (rol) { sql += ' AND r.nombre = ?'; params.push(rol); }
  sql += ' ORDER BY r.nombre, apellidos';

  const [filas] = await pool.query(sql, params);
  return filas;
}

async function obtenerPorId(id) {
  const [filas] = await pool.query(
    `SELECT u.id_usuario, u.correo, u.proveedor, u.activo, u.id_rol, r.nombre AS rol,
            u.id_empleado, u.id_cliente
     FROM USUARIO u JOIN ROL r ON r.id_rol = u.id_rol
     WHERE u.id_usuario = ?`,
    [id]
  );
  return filas[0] || null;
}

async function cambiarRol(id, nombreRol) {
  const [rolFilas] = await pool.query('SELECT id_rol FROM ROL WHERE nombre = ?', [nombreRol]);
  if (rolFilas.length === 0) throw new Error('Rol inválido');
  await pool.query('UPDATE USUARIO SET id_rol = ? WHERE id_usuario = ?', [rolFilas[0].id_rol, id]);
  return obtenerPorId(id);
}

async function cambiarEstado(id, activo) {
  await pool.query('UPDATE USUARIO SET activo = ? WHERE id_usuario = ?', [activo ? 1 : 0, id]);
  return obtenerPorId(id);
}

async function listarRoles() {
  const [filas] = await pool.query('SELECT id_rol, nombre, descripcion FROM ROL WHERE activo = 1 ORDER BY nombre');
  return filas;
}

module.exports = { listar, obtenerPorId, cambiarRol, cambiarEstado, listarRoles };
