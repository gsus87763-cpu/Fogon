import { useEffect, useState } from 'react';
import api from '../services/api';

const CATEGORIAS = ['Entrada', 'Plato Fuerte', 'Postre', 'Bebida', 'Adicional'];
const VACIO = { id_carta: 1, nombre: '', descripcion: '', categoria: 'Entrada', precio: '', unidad_de_medida: 'porción', imagen_url: '', cupo_diario: '' };

export default function PanelProductos() {
  const [productos, setProductos] = useState([]);
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [errores, setErrores] = useState([]);
  const [mensaje, setMensaje] = useState(null);

  function cargar() {
    api.get('/productos', { params: { incluirInactivos } }).then((res) => setProductos(res.data));
  }
  useEffect(cargar, [incluirInactivos]);

  function actualizarCampo(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function validarLocal() {
    const errs = [];
    if (!form.nombre || form.nombre.trim().length < 2) errs.push('El nombre debe tener al menos 2 caracteres');
    if (!form.precio || Number(form.precio) <= 0) errs.push('El precio debe ser mayor a 0');
    return errs;
  }

  async function guardar(e) {
    e.preventDefault();
    setMensaje(null);
    const errs = validarLocal();
    setErrores(errs);
    if (errs.length > 0) return;

    try {
      const payload = { ...form, cupo_diario: form.cupo_diario === '' ? null : Number(form.cupo_diario) };
      if (editandoId) {
        await api.put(`/productos/${editandoId}`, payload);
        setMensaje({ tipo: 'exito', texto: 'Producto actualizado' });
      } else {
        await api.post('/productos', payload);
        setMensaje({ tipo: 'exito', texto: 'Producto creado' });
      }
      setForm(VACIO);
      setEditandoId(null);
      cargar();
    } catch (err) {
      setErrores(err.response?.data?.errores || [err.response?.data?.mensaje || 'Error al guardar']);
    }
  }

  function editar(p) {
    setEditandoId(p.id_producto);
    setForm({
      id_carta: p.id_carta, nombre: p.nombre, descripcion: p.descripcion || '',
      categoria: p.categoria, precio: p.precio, unidad_de_medida: p.unidad_de_medida || '',
      imagen_url: p.imagen_url || '', cupo_diario: p.cupo_diario ?? ''
    });
  }

  async function eliminar(id) {
    if (!confirm('¿Desactivar este producto? No se borrará de la base de datos, solo dejará de mostrarse en la carta.')) return;
    await api.delete(`/productos/${id}`);
    cargar();
  }

  async function restaurar(id) {
    await api.patch(`/productos/${id}/restaurar`);
    cargar();
  }

  return (
    <div className="contenedor" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="panel-encabezado">
        <h1>Gestión de la carta</h1>
        <label style={{ fontSize: '.9rem' }}>
          <input type="checkbox" checked={incluirInactivos} onChange={(e) => setIncluirInactivos(e.target.checked)} />
          {' '}Mostrar productos desactivados
        </label>
      </div>

      <div className="tarjeta" style={{ marginBottom: 24 }}>
        <h3>{editandoId ? 'Editar producto' : 'Nuevo producto'}</h3>
        {mensaje && <div className={`mensaje-alerta ${mensaje.tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error'}`}>{mensaje.texto}</div>}
        {errores.length > 0 && (
          <div className="mensaje-alerta mensaje-error">
            <ul style={{ margin: 0, paddingLeft: 18 }}>{errores.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        )}
        <form className="formulario" onSubmit={guardar}>
          <div className="campo">
            <label>Nombre</label>
            <input required value={form.nombre} onChange={(e) => actualizarCampo('nombre', e.target.value)} />
          </div>
          <div className="campo">
            <label>Descripción</label>
            <textarea rows={2} value={form.descripcion} onChange={(e) => actualizarCampo('descripcion', e.target.value)} />
          </div>
          <div className="campo">
            <label>Categoría</label>
            <select value={form.categoria} onChange={(e) => actualizarCampo('categoria', e.target.value)}>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="campo">
            <label>Precio (Bs)</label>
            <input type="number" step="0.01" required value={form.precio} onChange={(e) => actualizarCampo('precio', e.target.value)} />
          </div>
          <div className="campo">
            <label>URL de imagen (opcional)</label>
            <input value={form.imagen_url} onChange={(e) => actualizarCampo('imagen_url', e.target.value)} placeholder="https://…" />
            <span className="ayuda-campo">Si se deja vacío, la tarjeta muestra una textura de respaldo.</span>
          </div>
          <div className="campo">
            <label>Cupo diario (opcional)</label>
            <input type="number" min="0" value={form.cupo_diario} onChange={(e) => actualizarCampo('cupo_diario', e.target.value)} placeholder="Sin límite" />
            <span className="ayuda-campo">Máximo reservable por día. Se calcula sobre las reservas de esa fecha; vacío = sin límite.</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="boton boton-primario">{editandoId ? 'Guardar cambios' : 'Crear producto'}</button>
            {editandoId && (
              <button type="button" className="boton boton-outline" onClick={() => { setEditandoId(null); setForm(VACIO); }}>
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="tabla-envoltorio">
        <table className="tabla">
          <thead>
            <tr><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Cupo diario</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id_producto}>
                <td>{p.nombre}</td>
                <td>{p.categoria}</td>
                <td>Bs {Number(p.precio).toFixed(2)}</td>
                <td>{p.cupo_diario == null ? 'Sin límite' : `${p.disponible_hoy ?? p.cupo_diario} / ${p.cupo_diario} hoy`}</td>
                <td>{p.estado ? 'Activo' : <span className="etiqueta-inactivo">Desactivado</span>}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button className="boton boton-outline" onClick={() => editar(p)}>Editar</button>
                  {p.estado ? (
                    <button className="boton boton-peligro" onClick={() => eliminar(p.id_producto)}>Desactivar</button>
                  ) : (
                    <button className="boton boton-primario" onClick={() => restaurar(p.id_producto)}>Reactivar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
