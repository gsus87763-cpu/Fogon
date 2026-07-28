const pool = require('../config/db');
const { TABLAS, tablaValida, accionesPermitidas } = require('../config/crudTablas');
const { generarPdfTabla, generarExcelTabla } = require('../utils/exportadores');

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

function columnasSelect(meta) {
  const columnas = meta.pk ? [meta.pk, ...meta.columnas] : meta.columnas;
  // dedupe por si el pk ya viniera repetido en columnas
  return [...new Set(columnas)].map((c) => `\`${c}\``).join(', ');
}

// Filtrado simple por columna: /api/admin-tablas/producto_emplatado?categoria=Postre
// Solo se aceptan columnas de la lista blanca de la tabla (evita SQL injection
// por nombre de columna) y el valor siempre va parametrizado. Se comparte entre
// listar() y las exportaciones para que "lo que ves es lo que exportas".
function construirFiltro(meta, query) {
  const columnasFiltrables = meta.pk ? [meta.pk, ...meta.columnas] : meta.columnas;
  const filtrosValidos = Object.entries(query).filter(
    ([clave, valor]) => columnasFiltrables.includes(clave) && valor !== '' && valor !== undefined
  );
  return {
    clausula: filtrosValidos.length > 0 ? ' WHERE ' + filtrosValidos.map(([clave]) => `\`${clave}\` = ?`).join(' AND ') : '',
    valores: filtrosValidos.map(([, valor]) => valor)
  };
}

async function listar(req, res) {
  const meta = verificarAcceso(req, res, 'leer');
  if (!meta) return;
  const { tabla } = req.params;
  try {
    const limite = Math.min(Number(req.query.limite) || 200, 1000);
    const { clausula, valores } = construirFiltro(meta, req.query);

    const sql = `SELECT ${columnasSelect(meta)} FROM \`${tabla}\`${clausula} LIMIT ?`;
    const [filas] = await pool.query(sql, [...valores, limite]);
    res.json(filas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: `Error al listar ${tabla}` });
  }
}

// Convierte "fecha_nacimiento" -> "Fecha Nacimiento" para encabezados legibles.
function tituloColumna(col) {
  return col
    .split('_')
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
}

function columnasParaExportar(meta) {
  const columnas = meta.pk ? [meta.pk, ...meta.columnas] : meta.columnas;
  return [...new Set(columnas)].map((clave) => ({ clave, titulo: tituloColumna(clave) }));
}

async function filasParaExportar(tabla, meta, query) {
  const { clausula, valores } = construirFiltro(meta, query);
  // Las exportaciones no llevan LIMIT de paginación (hasta un tope de seguridad).
  const sql = `SELECT ${columnasSelect(meta)} FROM \`${tabla}\`${clausula} LIMIT 5000`;
  const [filas] = await pool.query(sql, valores);
  return filas;
}

// GET /api/admin-tablas/:tabla/exportar/excel  (respeta los mismos filtros que listar)
async function exportarExcel(req, res) {
  const meta = verificarAcceso(req, res, 'leer');
  if (!meta) return;
  const { tabla } = req.params;
  try {
    const filas = await filasParaExportar(tabla, meta, req.query);
    await generarExcelTabla(res, {
      archivo: `el_fogon_${tabla}`,
      hoja: tituloColumna(tabla).slice(0, 31),
      columnas: columnasParaExportar(meta),
      filas
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: `Error al exportar ${tabla} a Excel` });
  }
}

// GET /api/admin-tablas/:tabla/exportar/pdf
async function exportarPdf(req, res) {
  const meta = verificarAcceso(req, res, 'leer');
  if (!meta) return;
  const { tabla } = req.params;
  try {
    const filas = await filasParaExportar(tabla, meta, req.query);
    generarPdfTabla(res, {
      archivo: `el_fogon_${tabla}`,
      titulo: `Reporte: ${tituloColumna(tabla)}`,
      subtitulo: `Generado el ${new Date().toLocaleDateString('es-BO')}`,
      columnas: columnasParaExportar(meta),
      filas
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: `Error al exportar ${tabla} a PDF` });
  }
}

async function obtener(req, res) {
  const meta = verificarAcceso(req, res, 'leer');
  if (!meta || !meta.pk) return res.status(400).json({ mensaje: 'Esta tabla no tiene una llave primaria simple para consultar por ID' });
  const { tabla, id } = req.params;
  try {
    const [filas] = await pool.query(`SELECT ${columnasSelect(meta)} FROM \`${tabla}\` WHERE \`${meta.pk}\` = ?`, [id]);
    if (filas.length === 0) return res.status(404).json({ mensaje: 'Registro no encontrado' });
    res.json(filas[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: `Error al obtener el registro de ${tabla}` });
  }
}

// Antes de mandar los valores a MySQL, una cadena vacía se normaliza a NULL.
// Sin esto, un campo opcional que el usuario deja en blanco (una fecha, un
// id_responsable, etc.) llega como '' y MySQL la rechaza en columnas
// numéricas/fecha (bajo sql_mode estricto), tumbando el UPDATE/INSERT entero
// aunque el resto de columnas sí traigan datos válidos.
function normalizarValor(valor) {
  return valor === '' ? null : valor;
}

function construirSetCamposValidos(meta, body) {
  const campos = meta.columnas.filter((c) => Object.prototype.hasOwnProperty.call(body, c));
  const valores = campos.map((c) => normalizarValor(body[c]));
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
      const [[fila]] = await pool.query(`SELECT ${columnasSelect(meta)} FROM \`${tabla}\` WHERE \`${meta.pk}\` = ?`, [resultado.insertId]);
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
    const [[fila]] = await pool.query(`SELECT ${columnasSelect(meta)} FROM \`${tabla}\` WHERE \`${meta.pk}\` = ?`, [id]);
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

module.exports = { tablasDisponibles, listar, obtener, crear, actualizar, eliminar, exportarExcel, exportarPdf };
