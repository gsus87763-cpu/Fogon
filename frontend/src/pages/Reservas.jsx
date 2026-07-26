import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Cargando from '../components/Cargando.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';
import { IconoAdvertencia, IconoCheck, IconoCalendario, IconoMas, IconoMenos, IconoBasura, IconoCarrito } from '../components/Icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCarrito } from '../context/CarritoContext.jsx';

const PASOS = [
  { titulo: 'Elige fecha y hora', texto: 'Selecciona cuándo te gustaría venir a comer con nosotros.' },
  { titulo: 'Elige mesa y platos', texto: 'Salón, terraza o salón de eventos — y agrega desde la Carta los platos que quieras anticipar.' },
  { titulo: 'Confirma tu reserva', texto: 'Recibe la confirmación y gestiona tu reserva desde tu panel.' }
];

const VACIO = { id_mesa: '', fecha: '', hora: '', cantidad_personas: 2, motivo: '' };

export default function Reservas() {
  const { usuario } = useAuth();
  const { items, actualizarCantidad, quitar, vaciar, total } = useCarrito();
  const [mesas, setMesas] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [tocado, setTocado] = useState({});
  const [misReservas, setMisReservas] = useState([]);
  const [cargandoReservas, setCargandoReservas] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [reservaConfirmada, setReservaConfirmada] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api.get('/mesas').then((res) => setMesas(res.data));
  }, []);

  useEffect(() => {
    if (usuario?.rol === 'cliente') cargarMisReservas();
  }, [usuario]);

  function cargarMisReservas() {
    setCargandoReservas(true);
    api.get('/reservas/mias')
      .then((res) => setMisReservas(res.data))
      .catch(() => {})
      .finally(() => setCargandoReservas(false));
  }

  function actualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
    setTocado((t) => ({ ...t, [campo]: true }));
  }

  function errorDe(campo) {
    if (!tocado[campo]) return null;
    if (campo === 'id_mesa' && !form.id_mesa) return 'Selecciona una mesa';
    if (campo === 'fecha') {
      if (!form.fecha) return 'La fecha es obligatoria';
      if (new Date(form.fecha) < new Date(new Date().toDateString())) return 'No se puede reservar en el pasado';
    }
    if (campo === 'hora' && !form.hora) return 'La hora es obligatoria';
    if (campo === 'cantidad_personas' && (!form.cantidad_personas || form.cantidad_personas < 1)) {
      return 'Debe ser al menos 1 persona';
    }
    return null;
  }

  const formularioValido = form.id_mesa && form.fecha && form.hora && form.cantidad_personas > 0
    && !errorDe('fecha');

  async function enviar(e) {
    e.preventDefault();
    setMensaje(null);
    setTocado({ id_mesa: true, fecha: true, hora: true, cantidad_personas: true });
    if (!formularioValido) return;

    setEnviando(true);
    try {
      const platos = items.map((i) => ({ id_producto: i.id_producto, cantidad: i.cantidad }));
      const res = await api.post('/reservas', { ...form, platos });
      const mesaElegida = mesas.find((m) => String(m.id_mesa) === String(form.id_mesa));
      setReservaConfirmada({ ...res.data, ambiente: mesaElegida?.ambiente, numero_mesa: mesaElegida?.numero });
      setForm(VACIO);
      setTocado({});
      vaciar();
      cargarMisReservas();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.mensaje || 'No se pudo crear la reserva' });
    } finally {
      setEnviando(false);
    }
  }

  async function cancelar(id) {
    await api.patch(`/reservas/${id}/cancelar`);
    cargarMisReservas();
  }

  if (!usuario) {
    return (
      <div className="contenedor" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <span className="eyebrow">Reservas</span>
        <h1>Reserva tu mesa en El Fogón</h1>
        <p className="subtitulo-seccion">Inicia sesión como cliente para reservar una mesa en línea, sin llamadas ni esperas.</p>
        <Link to="/login" className="boton boton-primario" style={{ marginTop: 10 }}>Iniciar sesión</Link>
      </div>
    );
  }

  if (usuario.rol !== 'cliente') {
    return (
      <div className="contenedor" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <h1>Reservas</h1>
        <p>Este formulario es para clientes. Como personal interno, gestiona las reservas desde tu panel.</p>
        <Link to="/panel" className="boton boton-primario">Ir a mi panel</Link>
      </div>
    );
  }

  return (
    <div className="contenedor" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <span className="eyebrow">Reservas</span>
      <h1>Reserva tu mesa</h1>
      <p className="subtitulo-seccion">Tres pasos y tu mesa queda apartada. Te avisamos apenas quede confirmada.</p>

      <div className="pasos">
        {PASOS.map((p, i) => (
          <div className="paso" key={p.titulo}>
            <div className="numero">{i + 1}</div>
            <h4>{p.titulo}</h4>
            <p>{p.texto}</p>
          </div>
        ))}
      </div>

      {reservaConfirmada ? (
        <div className="resumen-confirmacion aparecer">
          <div className="titulo-confirmado">
            <span className="marca-check"><IconoCheck width="14" height="14" /></span>
            <span>Reserva registrada</span>
          </div>
          <p style={{ color: 'var(--texto-secundario)', fontSize: '.9rem', marginTop: 8 }}>
            Tu mesa quedó en estado <strong>{reservaConfirmada.estado}</strong>, pendiente de confirmación
            por parte del salón.
          </p>
          <ul className="lista-resumen">
            <li><span>Fecha</span><span>{reservaConfirmada.fecha}</span></li>
            <li><span>Hora</span><span>{reservaConfirmada.hora}</span></li>
            <li><span>Ambiente</span><span>{reservaConfirmada.ambiente}</span></li>
            <li><span>Mesa</span><span>N.º {reservaConfirmada.numero_mesa}</span></li>
            <li><span>Personas</span><span>{reservaConfirmada.cantidad_personas}</span></li>
            {reservaConfirmada.platos?.length > 0 && (
              <li><span>Platos anticipados</span><span>{reservaConfirmada.platos.length}</span></li>
            )}
          </ul>
          <button className="boton boton-outline" style={{ marginTop: 16 }} onClick={() => setReservaConfirmada(null)}>
            Hacer otra reserva
          </button>
        </div>
      ) : (
        <div className="reservas-layout">
          <div>
            {mensaje && (
              <div className="mensaje-alerta mensaje-error">
                <IconoAdvertencia /> {mensaje.texto}
              </div>
            )}
            <form className="formulario" onSubmit={enviar} noValidate>
              <div className="campo">
                <label>Mesa</label>
                <select
                  className={errorDe('id_mesa') ? 'campo-invalido' : ''}
                  value={form.id_mesa}
                  onChange={(e) => actualizar('id_mesa', e.target.value)}
                  onBlur={() => setTocado((t) => ({ ...t, id_mesa: true }))}
                >
                  <option value="">Selecciona una mesa</option>
                  {mesas.map((m) => (
                    <option key={m.id_mesa} value={m.id_mesa}>
                      {m.ambiente} — Mesa {m.numero} (hasta {m.capacidad_maxima} personas)
                    </option>
                  ))}
                </select>
                {errorDe('id_mesa') && <span className="error-campo"><IconoAdvertencia /> {errorDe('id_mesa')}</span>}
              </div>

              <div className="campo">
                <label>Fecha</label>
                <input
                  type="date"
                  className={errorDe('fecha') ? 'campo-invalido' : ''}
                  value={form.fecha}
                  onChange={(e) => actualizar('fecha', e.target.value)}
                  onBlur={() => setTocado((t) => ({ ...t, fecha: true }))}
                />
                {errorDe('fecha') && <span className="error-campo"><IconoAdvertencia /> {errorDe('fecha')}</span>}
              </div>

              <div className="campo">
                <label>Hora</label>
                <input
                  type="time"
                  className={errorDe('hora') ? 'campo-invalido' : ''}
                  value={form.hora}
                  onChange={(e) => actualizar('hora', e.target.value)}
                  onBlur={() => setTocado((t) => ({ ...t, hora: true }))}
                />
                {errorDe('hora') && <span className="error-campo"><IconoAdvertencia /> {errorDe('hora')}</span>}
              </div>

              <div className="campo">
                <label>Cantidad de personas</label>
                <input
                  type="number" min="1"
                  className={errorDe('cantidad_personas') ? 'campo-invalido' : ''}
                  value={form.cantidad_personas}
                  onChange={(e) => actualizar('cantidad_personas', Number(e.target.value))}
                  onBlur={() => setTocado((t) => ({ ...t, cantidad_personas: true }))}
                />
                {errorDe('cantidad_personas') && <span className="error-campo"><IconoAdvertencia /> {errorDe('cantidad_personas')}</span>}
              </div>

              <div className="campo">
                <label>Motivo (opcional)</label>
                <input value={form.motivo} onChange={(e) => actualizar('motivo', e.target.value)} placeholder="Cumpleaños, aniversario…" />
              </div>

              <button className="boton boton-primario" disabled={enviando}>
                {enviando ? 'Reservando…' : 'Confirmar reserva'}
              </button>
            </form>
          </div>

          {/* --- Carrito de platos para anticipar en la reserva --- */}
          <aside className="carrito-reserva">
            <h3><IconoCarrito width="18" height="18" /> Platos para tu reserva</h3>
            {items.length === 0 ? (
              <p className="ayuda-campo">
                Aún no agregaste platos. Ve a la <Link to="/carta">Carta</Link> y agrega los que quieras
                anticipar — es opcional, tu mesa se puede reservar sin platos.
              </p>
            ) : (
              <>
                <ul className="carrito-reserva__lista">
                  {items.map((i) => (
                    <li key={i.id_producto}>
                      <div className={`carrito-reserva__miniatura ${i.imagen_url ? '' : 'carrito-reserva__miniatura--textura'}`}>
                        {i.imagen_url && <img src={i.imagen_url} alt={i.nombre} />}
                      </div>
                      <div className="carrito-reserva__info">
                        <strong>{i.nombre}</strong>
                        <span>Bs {Number(i.precio).toFixed(2)}</span>
                      </div>
                      <div className="selector-cantidad selector-cantidad--compacto">
                        <button type="button" onClick={() => actualizarCantidad(i.id_producto, i.cantidad - 1)} aria-label="Quitar uno"><IconoMenos /></button>
                        <span>{i.cantidad}</span>
                        <button type="button" onClick={() => actualizarCantidad(i.id_producto, i.cantidad + 1)} aria-label="Agregar uno"><IconoMas /></button>
                      </div>
                      <button className="carrito-reserva__quitar" onClick={() => quitar(i.id_producto)} aria-label={`Quitar ${i.nombre}`}>
                        <IconoBasura />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="carrito-reserva__total">
                  <span>Total estimado</span>
                  <strong>Bs {total.toFixed(2)}</strong>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      <hr className="filete" />

      <h2>Mis reservas</h2>
      {cargandoReservas && <Cargando texto="Cargando tu historial de reservas…" />}

      {!cargandoReservas && misReservas.length === 0 && (
        <EstadoVacio icono={IconoCalendario} titulo="Aún no tienes reservas" texto="Cuando reserves una mesa, la verás listada aquí con su estado." />
      )}

      {!cargandoReservas && misReservas.length > 0 && (
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr><th>Fecha</th><th>Hora</th><th>Mesa</th><th>Ambiente</th><th>Platos</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {misReservas.map((r) => (
                <tr key={r.id_reserva}>
                  <td>{r.fecha}</td>
                  <td>{r.hora}</td>
                  <td>{r.numero_mesa}</td>
                  <td>{r.ambiente}</td>
                  <td>{r.platos?.length || 0}</td>
                  <td>{r.estado}</td>
                  <td>
                    {['PENDIENTE', 'CONFIRMADA'].includes(r.estado) && (
                      <button className="boton boton-outline" onClick={() => cancelar(r.id_reserva)}>Cancelar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
