import { useEffect, useState } from 'react';
import api from '../services/api';
import { IconoAdvertencia, IconoCheck } from '../components/Icons.jsx';

export default function PanelAmbientes() {
  const [ambientes, setAmbientes] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({});
  const [mensaje, setMensaje] = useState(null);

  function cargar() {
    api.get('/admin-tablas/ambiente').then((res) => setAmbientes(res.data));
  }
  useEffect(cargar, []);

  function editar(a) {
    setEditandoId(a.id_ambiente);
    setForm({
      nombre: a.nombre, horario_funcionamiento: a.horario_funcionamiento || '',
      caracteristica: a.caracteristica || '', capacidad: a.capacidad ?? 0, imagen_url: a.imagen_url || ''
    });
  }

  async function guardar(e) {
    e.preventDefault();
    setMensaje(null);
    try {
      await api.put(`/admin-tablas/ambiente/${editandoId}`, form);
      setMensaje({ tipo: 'exito', texto: 'Ambiente actualizado' });
      setEditandoId(null);
      cargar();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.mensaje || 'Error al guardar' });
    }
  }

  return (
    <div className="contenedor" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <h1>Ambientes</h1>
      <p style={{ color: 'var(--texto-secundario)' }}>Actualiza la imagen y los datos de cada salón/ambiente para que se vean en la página pública.</p>

      {mensaje && (
        <div className={`mensaje-alerta ${mensaje.tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error'}`} style={{ margin: '16px 0' }}>
          {mensaje.tipo === 'exito' ? <IconoCheck /> : <IconoAdvertencia />} {mensaje.texto}
        </div>
      )}

      <div className="rejilla" style={{ marginTop: 20 }}>
        {ambientes.map((a) => (
          <div key={a.id_ambiente} className="tarjeta">
            {editandoId === a.id_ambiente ? (
              <form className="formulario" onSubmit={guardar} style={{ maxWidth: 'none' }}>
                <div className="campo"><label>Nombre</label><input value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} /></div>
                <div className="campo"><label>Horario</label><input value={form.horario_funcionamiento} onChange={(e) => setForm((f) => ({ ...f, horario_funcionamiento: e.target.value }))} /></div>
                <div className="campo"><label>Característica</label><input value={form.caracteristica} onChange={(e) => setForm((f) => ({ ...f, caracteristica: e.target.value }))} /></div>
                <div className="campo"><label>Capacidad</label><input type="number" value={form.capacidad} onChange={(e) => setForm((f) => ({ ...f, capacidad: Number(e.target.value) }))} /></div>
                <div className="campo"><label>URL de imagen</label><input value={form.imagen_url} onChange={(e) => setForm((f) => ({ ...f, imagen_url: e.target.value }))} placeholder="https://…" /></div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="boton boton-primario">Guardar</button>
                  <button type="button" className="boton boton-outline" onClick={() => setEditandoId(null)}>Cancelar</button>
                </div>
              </form>
            ) : (
              <>
                {a.imagen_url && (
                  <img src={a.imagen_url} alt={a.nombre} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 'var(--radio)', marginBottom: 10 }} />
                )}
                <h3>{a.nombre}</h3>
                <p style={{ color: 'var(--texto-secundario)', fontSize: '.88rem' }}>
                  {a.caracteristica || 'Sin descripción'} · Capacidad {a.capacidad}
                </p>
                <button className="boton boton-outline" onClick={() => editar(a)}>Editar</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
