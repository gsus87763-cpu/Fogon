import { useEffect, useState } from 'react';
import api from '../services/api';
import { IconoAdvertencia, IconoCheck } from '../components/Icons.jsx';

const VACIO = { nombre: '', apellidos: '', ci: '', telefono: '', correo: '' };

function descargar(blob, nombreArchivo) {
  const url = window.URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  window.URL.revokeObjectURL(url);
}

export default function PanelClientes() {
  const [clientes, setClientes] = useState([]);
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [errores, setErrores] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [exportando, setExportando] = useState(false);

  function cargar() {
    api.get('/clientes', { params: { incluirInactivos, busqueda: busqueda || undefined } })
      .then((res) => setClientes(res.data));
  }
  useEffect(cargar, [incluirInactivos, busqueda]);

  function actualizarCampo(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function guardar(e) {
    e.preventDefault();
    setMensaje(null);
    setErrores([]);
    try {
      if (editandoId) {
        await api.put(`/clientes/${editandoId}`, form);
        setMensaje({ tipo: 'exito', texto: 'Cliente actualizado' });
      } else {
        await api.post('/clientes', form);
        setMensaje({ tipo: 'exito', texto: 'Cliente creado' });
      }
      setForm(VACIO);
      setEditandoId(null);
      cargar();
    } catch (err) {
      setErrores(err.response?.data?.errores || [err.response?.data?.mensaje || 'Error al guardar']);
    }
  }

  function editar(c) {
    setEditandoId(c.id_cliente);
    setForm({ nombre: c.nombre, apellidos: c.apellidos, ci: c.ci || '', telefono: c.telefono || '', correo: c.correo || '' });
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setForm(VACIO);
  }

  async function eliminar(id) {
    if (!confirm('¿Desactivar este cliente? No se borra de la base de datos, solo se marca como inactivo.')) return;
    await api.delete(`/clientes/${id}`);
    cargar();
  }

  async function restaurar(id) {
    await api.patch(`/clientes/${id}/restaurar`);
    cargar();
  }

  async function exportar(formato) {
    setExportando(true);
    try {
      const res = await api.get(`/estadisticas/reportes/clientes-${formato}`, { responseType: 'blob' });
      const tipo = formato === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      descargar(new Blob([res.data], { type: tipo }), `reporte_clientes.${formato === 'pdf' ? 'pdf' : 'xlsx'}`);
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="contenedor" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="panel-encabezado">
        <h1>Gestión de clientes</h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ fontSize: '.9rem' }}>
            <input type="checkbox" checked={incluirInactivos} onChange={(e) => setIncluirInactivos(e.target.checked)} /> Mostrar inactivos
          </label>
          <button className="boton boton-outline" disabled={exportando} onClick={() => exportar('pdf')}>Exportar PDF</button>
          <button className="boton boton-outline" disabled={exportando} onClick={() => exportar('excel')}>Exportar Excel</button>
        </div>
      </div>

      <input
        placeholder="Buscar por nombre, apellido, correo o CI…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ marginBottom: 20, maxWidth: 420 }}
      />

      <div className="tarjeta" style={{ marginBottom: 30 }}>
        <h3>{editandoId ? 'Editar cliente' : 'Nuevo cliente'}</h3>
        {mensaje && (
          <div className={`mensaje-alerta ${mensaje.tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error'}`}>
            {mensaje.tipo === 'exito' ? <IconoCheck /> : <IconoAdvertencia />} {mensaje.texto}
          </div>
        )}
        {errores.length > 0 && (
          <div className="mensaje-alerta mensaje-error">
            <IconoAdvertencia />
            <ul style={{ margin: 0, paddingLeft: 18 }}>{errores.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        )}
        <form className="formulario" onSubmit={guardar} style={{ maxWidth: 'none' }}>
          <div className="campo"><label>Nombre</label><input value={form.nombre} onChange={(e) => actualizarCampo('nombre', e.target.value)} /></div>
          <div className="campo"><label>Apellidos</label><input value={form.apellidos} onChange={(e) => actualizarCampo('apellidos', e.target.value)} /></div>
          <div className="campo"><label>CI</label><input value={form.ci} onChange={(e) => actualizarCampo('ci', e.target.value)} /></div>
          <div className="campo"><label>Teléfono</label><input value={form.telefono} onChange={(e) => actualizarCampo('telefono', e.target.value)} /></div>
          <div className="campo"><label>Correo</label><input type="email" value={form.correo} onChange={(e) => actualizarCampo('correo', e.target.value)} /></div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="boton boton-primario">{editandoId ? 'Guardar cambios' : 'Crear cliente'}</button>
            {editandoId && <button type="button" className="boton boton-outline" onClick={cancelarEdicion}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="tabla-envoltorio">
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th><th>CI</th><th>Teléfono</th><th>Correo</th><th>Reservas</th><th>Estado</th><th></th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id_cliente} style={{ opacity: c.activo ? 1 : 0.55 }}>
                <td>{c.nombre} {c.apellidos}</td>
                <td>{c.ci || '—'}</td>
                <td>{c.telefono || '—'}</td>
                <td>{c.correo || '—'}</td>
                <td>{c.total_reservas ?? 0}</td>
                <td>{c.activo ? 'Activo' : 'Inactivo'}</td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="boton boton-outline" onClick={() => editar(c)}>Editar</button>
                  {c.activo
                    ? <button className="boton boton-outline" onClick={() => eliminar(c.id_cliente)}>Desactivar</button>
                    : <button className="boton boton-outline" onClick={() => restaurar(c.id_cliente)}>Reactivar</button>}
                </td>
              </tr>
            ))}
            {clientes.length === 0 && <tr><td colSpan={7}>No hay clientes para mostrar.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
