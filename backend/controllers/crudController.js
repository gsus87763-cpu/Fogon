const pool = require('../config/db');
const { TABLAS, tablaValida, accionesPermitidas } = require('../config/crudTablas');

function verificarAcceso(req, res, accion) {
  const { tabla } = req.params;
  if (!tablaValida(tabla)) {
    res.status(404).json({ mensaje: `La tabla "${tabla}" no está habilitada para administración` });
    return null;
  }
  const permitidas = accionesPermitidas(req.user.rol, tabla);
  if (!permitidas.includes(accion)) {
    res.status(403).json({ mensaje: `Tu rol (${req.user.rol}) no tiene permiso de "${accion}" sobre "${tabla}"` });
    return null;
  }
  return TABLAS[tabla];
}

// GET /api/admin-tablas -> qué tablas y acciones puede usar el usuario logueado
// (para que el frontend arme el menú dinámicamente, sin hardcodear nada)
function tablasDisponibles(req, res) {
  const { PERMISOS_POR_ROL } = require('../config/crudTablas');
  const permisos = req.user.rol === 'admin'
    ? PERMISOS_POR_ROL.admin
    : (PERMISOS_POR_ROL[req.user.rol] || {});

  const resultado = Object.entries(permisos).map(([tabla, acciones]) => ({
    tabla,
    acciones,
    columnas: TABLAS[tabla]?.columnas || [],
    pk: TABLAS[tabla]?.pk || null
  }));
  res.json(resultado);
}

async function listar(req, res) {
  const meta = verificarAcceso(req, res, 'leer');
  if (!meta) return;
  const { tabla } = req.params;
  try {
    const limite = Math.min(Number(req.query.limite) || 200, 1000);
    const [filas] = await pool.query(`SELECT * FROM \`${tabla}\` LIMIT ?`, [limite]);
    res.json(filas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: `Error al listar ${tabla}` });
  }
}

async function obtener(req, res) {
  const meta = verificarAcceso(req, res, 'leer');
  if (!meta || !meta.pk) return res.status(400).json({ mensaje: 'Esta tabla no tiene una llave primaria simple para consultar por ID' });
  const { tabla, id } = req.params;
  try {
    const [filas] = await pool.query(`SELECT * FROM \`${tabla}\` WHERE \`${meta.pk}\` = ?`, [id]);
    if (filas.length === 0) return res.status(404).json({ mensaje: 'Registro no encontrado' });
    res.json(filas[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: `Error al obtener el registro de ${tabla}` });
  }
}

function construirSetCamposValidos(meta, body) {
  const campos = meta.columnas.filter((c) => Object.prototype.hasOwnProperty.call(body, c));
  const valores = campos.map((c) => body[c]);
  return { campos, valores };
}

async function crear(req, res) {
  const meta = verificarAcceso(req, res, 'crear');
  if (!meta) return;
  const { tabla } = req.params;
  const { campos, valores } = construirSetCamposValidos(meta, req.body);
  if (campos.length === 0) return res.status(400).json({ mensaje: 'No se recibió ningún campo válido para crear el registro' });

  try {
    const marcadores = campos.map(() => '?').join(', ');
    const columnasSql = campos.map((c) => `\`${c}\``).join(', ');
    const [resultado] = await pool.query(
      `INSERT INTO \`${tabla}\` (${columnasSql}) VALUES (${marcadores})`,
      valores
    );
    if (meta.pk) {
      const [[fila]] = await pool.query(`SELECT * FROM \`${tabla}\` WHERE \`${meta.pk}\` = ?`, [resultado.insertId]);
      return res.status(201).json(fila);
    }
    res.status(201).json({ mensaje: 'Registro creado', filasAfectadas: resultado.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(400).json({ mensaje: err.sqlMessage || `Error al crear el registro en ${tabla}` });
  }
}

async function actualizar(req, res) {
  const meta = verificarAcceso(req, res, 'editar');
  if (!meta || !meta.pk) return res.status(400).json({ mensaje: 'Esta tabla no admite edición por ID desde este endpoint' });
  const { tabla, id } = req.params;
  const { campos, valores } = construirSetCamposValidos(meta, req.body);
  if (campos.length === 0) return res.status(400).json({ mensaje: 'No se recibió ningún campo válido para actualizar' });

  try {
    const asignaciones = campos.map((c) => `\`${c}\` = ?`).join(', ');
    await pool.query(`UPDATE \`${tabla}\` SET ${asignaciones} WHERE \`${meta.pk}\` = ?`, [...valores, id]);
    const [[fila]] = await pool.query(`SELECT * FROM \`${tabla}\` WHERE \`${meta.pk}\` = ?`, [id]);
    if (!fila) return res.status(404).json({ mensaje: 'Registro no encontrado' });
    res.json(fila);
  } catch (err) {
    console.error(err);
    res.status(400).json({ mensaje: err.sqlMessage || `Error al actualizar el registro de ${tabla}` });
  }
}

async function eliminar(req, res) {
  const meta = verificarAcceso(req, res, 'eliminar');
  if (!meta || !meta.pk) return res.status(400).json({ mensaje: 'Esta tabla no admite borrado por ID desde este endpoint' });
  const { tabla, id } = req.params;
  try {
    await pool.query(`DELETE FROM \`${tabla}\` WHERE \`${meta.pk}\` = ?`, [id]);
    res.json({ mensaje: 'Registro eliminado' });
  } catch (err) {
    // p.ej. empleado: el trigger trg_empleado_prevenir_borrado_fisico bloquea
    // el DELETE físico y obliga a usar baja lógica (UPDATE estado='Inactivo')
    console.error(err);
    res.status(400).json({ mensaje: err.sqlMessage || `Error al eliminar el registro de ${tabla}` });
  }
}

module.exports = { tablasDisponibles, listar, obtener, crear, actualizar, eliminar };
