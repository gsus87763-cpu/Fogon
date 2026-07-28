import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { IconoAdvertencia, IconoCheck, IconoBasura, IconoMas, IconoCerrar } from '../components/Icons.jsx';

function descargar(blob, nombreArchivo) {
  const url = window.URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  window.URL.revokeObjectURL(url);
}

// Encabezado legible a partir del nombre de columna: "fecha_nacimiento" -> "Fecha Nacimiento"
function tituloColumna(col) {
  return col.split('_').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

// Tipo de <input> según el nombre de la columna (heurística simple, sin
// hardcodear tabla por tabla): fechas -> date, todo lo demás -> texto libre
// (el usuario puede escribir números, enums, etc. y el backend los valida).
function tipoInput(col) {
  if (col.startsWith('fecha')) return 'date';
  return 'text';
}

function valorVacioForm(meta) {
  const base = {};
  meta.columnas.forEach((c) => { base[c] = ''; });
  return base;
}

export default function PanelTablas() {
  const [tablas, setTablas] = useState([]);
  const [tablaActiva, setTablaActiva] = useState(null);
  const [filas, setFilas] = useState([]);
  const [cargandoFilas, setCargandoFilas] = useState(false);
  const [cargandoTablas, setCargandoTablas] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [exportando, setExportando] = useState(false);

  const [filtroColumna, setFiltroColumna] = useState('');
  const [filtroValor, setFiltroValor] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({});
  const [erroresForm, setErroresForm] = useState([]);

  const meta = useMemo(() => tablas.find((t) => t.tabla === tablaActiva) || null, [tablas, tablaActiva]);

  useEffect(() => {
    api.get('/admin-tablas')
      .then((res) => {
        const disponibles = res.data.filter((t) => t.acciones.includes('leer'));
        setTablas(disponibles);
        if (disponibles.length > 0) setTablaActiva(disponibles[0].tabla);
      })
      .catch((err) => setMensaje({ tipo: 'error', texto: err.response?.data?.mensaje || 'No se pudo cargar la lista de tablas' }))
      .finally(() => setCargandoTablas(false));
  }, []);

  function cargarFilas() {
    if (!tablaActiva) return;
    setCargandoFilas(true);
    const params = { limite: 500 };
    if (filtroColumna && filtroValor !== '') params[filtroColumna] = filtroValor;
    api.get(`/admin-tablas/${tablaActiva}`, { params })
      .then((res) => setFilas(res.data))
      .catch((err) => setMensaje({ tipo: 'error', texto: err.response?.data?.mensaje || `No se pudo cargar ${tablaActiva}` }))
      .finally(() => setCargandoFilas(false));
  }

  useEffect(() => {
    setFiltroColumna('');
    setFiltroValor('');
    setMensaje(null);
    cargarFilas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tablaActiva]);

  function seleccionarTabla(t) {
    setTablaActiva(t);
  }

  function abrirNuevo() {
    if (!meta) return;
    setEditandoId(null);
    setForm(valorVacioForm(meta));
    setErroresForm([]);
    setModalAbierto(true);
  }

  function abrirEditar(fila) {
    if (!meta) return;
    setEditandoId(fila[meta.pk]);
    const valores = {};
    meta.columnas.forEach((c) => { valores[c] = fila[c] ?? ''; });
    setForm(valores);
    setErroresForm([]);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setErroresForm([]);
  }

  async function guardar(e) {
    e.preventDefault();
    setErroresForm([]);
    try {
      if (editandoId != null) {
        await api.put(`/admin-tablas/${tablaActiva}/${editandoId}`, form);
        setMensaje({ tipo: 'exito', texto: 'Registro actualizado' });
      } else {
        await api.post(`/admin-tablas/${tablaActiva}`, form);
        setMensaje({ tipo: 'exito', texto: 'Registro creado' });
      }
      setModalAbierto(false);
      cargarFilas();
    } catch (err) {
      setErroresForm([err.response?.data?.mensaje || 'Error al guardar el registro']);
    }
  }

  async function eliminar(fila) {
    if (!meta?.pk) return;
    if (!confirm('¿Eliminar este registro de la base de datos? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete(`/admin-tablas/${tablaActiva}/${fila[meta.pk]}`);
      setMensaje({ tipo: 'exito', texto: 'Registro eliminado' });
      cargarFilas();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.mensaje || 'No se pudo eliminar (puede tener registros relacionados)' });
    }
  }

  async function exportar(formato) {
    if (!tablaActiva) return;
    setExportando(true);
    try {
      const params = {};
      if (filtroColumna && filtroValor !== '') params[filtroColumna] = filtroValor;
      const res = await api.get(`/admin-tablas/${tablaActiva}/exportar/${formato}`, { params, responseType: 'blob' });
      const tipo = formato === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      descargar(new Blob([res.data], { type: tipo }), `el_fogon_${tablaActiva}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'No se pudo generar el archivo de exportación' });
    } finally {
      setExportando(false);
    }
  }

  const columnasVisibles = meta ? (meta.pk ? [meta.pk, ...meta.columnas] : meta.columnas) : [];
  const puedeCrear = meta?.acciones.includes('crear');
  const puedeEditar = meta?.acciones.includes('editar') && meta?.pk;
  const puedeEliminar = meta?.acciones.includes('eliminar') && meta?.pk;

  return (
    <div className="contenedor" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="panel-encabezado">
        <div>
          <h1>Todas las tablas</h1>
          <p style={{ color: 'var(--texto-secundario)', margin: 0 }}>
            Administra cualquier tabla de la base de datos según lo que tu rol tiene permitido.
          </p>
        </div>
      </div>

      {mensaje && (
        <div className={`mensaje-alerta ${mensaje.tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error'}`} style={{ margin: '16px 0' }}>
          {mensaje.tipo === 'exito' ? <IconoCheck /> : <IconoAdvertencia />} {mensaje.texto}
        </div>
      )}

      {cargandoTablas ? (
        <p>Cargando tablas disponibles…</p>
      ) : tablas.length === 0 ? (
        <p>Tu rol no tiene tablas habilitadas para administrar todavía.</p>
      ) : (
        <div className="panel-tablas-layout" style={{ marginTop: 20 }}>
          <nav className="panel-tablas-sidebar">
            {tablas.map((t) => (
              <button
                key={t.tabla}
                className={t.tabla === tablaActiva ? 'panel-tablas-sidebar__activa' : ''}
                onClick={() => seleccionarTabla(t.tabla)}
              >
                {tituloColumna(t.tabla)}
              </button>
            ))}
          </nav>

          <div className="panel-tablas-contenido">
            {meta && (
              <>
                <div className="panel-encabezado">
                  <h3 style={{ margin: 0 }}>{tituloColumna(meta.tabla)} <span style={{ color: 'var(--texto-secundario)', fontWeight: 400, fontSize: '.85rem' }}>({filas.length} registro{filas.length === 1 ? '' : 's'})</span></h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {puedeCrear && (
                      <button className="boton boton-primario" onClick={abrirNuevo}><IconoMas /> Nuevo registro</button>
                    )}
                    <button className="boton boton-outline" disabled={exportando} onClick={() => exportar('excel')}>Exportar Excel</button>
                    <button className="boton boton-outline" disabled={exportando} onClick={() => exportar('pdf')}>Exportar PDF</button>
                  </div>
                </div>

                <div className="tarjeta" style={{ marginBottom: 18, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div className="campo" style={{ margin: 0 }}>
                    <label>Filtrar por columna</label>
                    <select value={filtroColumna} onChange={(e) => setFiltroColumna(e.target.value)}>
                      <option value="">— Sin filtro —</option>
                      {columnasVisibles.map((c) => <option key={c} value={c}>{tituloColumna(c)}</option>)}
                    </select>
                  </div>
                  <div className="campo" style={{ margin: 0 }}>
                    <label>Valor</label>
                    <input value={filtroValor} onChange={(e) => setFiltroValor(e.target.value)} disabled={!filtroColumna} placeholder="Valor exacto" />
                  </div>
                  <button className="boton boton-outline" onClick={cargarFilas}>Aplicar</button>
                  {filtroColumna && (
                    <button className="boton boton-outline" onClick={() => { setFiltroColumna(''); setFiltroValor(''); setTimeout(cargarFilas, 0); }}>Limpiar</button>
                  )}
                </div>

                {cargandoFilas ? (
                  <p>Cargando registros…</p>
                ) : (
                  <div className="tabla-envoltorio">
                    <table className="tabla">
                      <thead>
                        <tr>
                          {columnasVisibles.map((c) => <th key={c}>{tituloColumna(c)}</th>)}
                          {(puedeEditar || puedeEliminar) && <th></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {filas.map((fila, idx) => (
                          <tr key={meta.pk ? fila[meta.pk] : idx}>
                            {columnasVisibles.map((c) => (
                              <td key={c}>{typeof fila[c] === 'boolean' ? (fila[c] ? 'Sí' : 'No') : String(fila[c] ?? '—')}</td>
                            ))}
                            {(puedeEditar || puedeEliminar) && (
                              <td style={{ display: 'flex', gap: 8 }}>
                                {puedeEditar && <button className="boton boton-outline" onClick={() => abrirEditar(fila)}>Editar</button>}
                                {puedeEliminar && <button className="boton boton-peligro" onClick={() => eliminar(fila)}><IconoBasura /></button>}
                              </td>
                            )}
                          </tr>
                        ))}
                        {filas.length === 0 && (
                          <tr><td colSpan={columnasVisibles.length + 1}>Sin registros.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {modalAbierto && meta && (
        <div className="modal-fondo" onClick={cerrarModal}>
          <div className="modal-generico" onClick={(e) => e.stopPropagation()}>
            <button className="modal-generico__cerrar" onClick={cerrarModal}><IconoCerrar /></button>
            <h3>{editandoId != null ? `Editar ${tituloColumna(meta.tabla)} #${editandoId}` : `Nuevo registro en ${tituloColumna(meta.tabla)}`}</h3>
            {erroresForm.length > 0 && (
              <div className="mensaje-alerta mensaje-error">
                <ul style={{ margin: 0, paddingLeft: 18 }}>{erroresForm.map((er, i) => <li key={i}>{er}</li>)}</ul>
              </div>
            )}
            <form className="formulario" onSubmit={guardar}>
              {meta.columnas.map((c) => (
                <div className="campo" key={c}>
                  <label>{tituloColumna(c)}</label>
                  <input
                    type={tipoInput(c)}
                    value={form[c] ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, [c]: e.target.value }))}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="boton boton-primario">{editandoId != null ? 'Guardar cambios' : 'Crear registro'}</button>
                <button type="button" className="boton boton-outline" onClick={cerrarModal}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
