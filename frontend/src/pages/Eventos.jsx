import { useEffect, useState } from 'react';
import api from '../services/api';

const DESCRIPCION_ESPACIO = {
  'Salón de Eventos': 'Espacio privado, capacidad hasta 20 personas, ideal para celebraciones cerradas.',
  'Terraza': 'Ambiente al aire libre, buena opción para eventos informales de día.',
  'Salón Principal': 'Nuestro espacio insignia, también disponible para reservas grupales grandes.'
};

const TIPOS_EVENTO = [
  {
    nombre: 'Cumpleaños',
    capacidad: 'Hasta 20 personas',
    ambiente: 'Salón de Eventos o Terraza',
    incluye: ['Menú personalizado', 'Torta de cortesía', 'Decoración base incluida']
  },
  {
    nombre: 'Eventos corporativos',
    capacidad: 'Hasta 20 personas',
    ambiente: 'Salón de Eventos',
    incluye: ['Proyector disponible', 'Menú ejecutivo o de pasapalos', 'Atención dedicada']
  },
  {
    nombre: 'Aniversarios y matrimonios',
    capacidad: 'Consultar según fecha',
    ambiente: 'Salón Principal o Salón de Eventos',
    incluye: ['Menú de varios tiempos', 'Maridaje sugerido', 'Coordinación del día']
  }
];

export default function Eventos() {
  const [form, setForm] = useState({ nombre: '', correo: '', fecha: '', invitados: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);
  const [ambientes, setAmbientes] = useState([]);

  useEffect(() => {
    api.get('/ambientes').then((res) => setAmbientes(res.data));
  }, []);

  function actualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  // La consulta se envía por correo (mailto): el backend actual no expone un
  // endpoint de "solicitud de evento", así que evitamos simular un guardado que
  // no existe y usamos el canal de contacto real del restaurante.
  function enviarConsulta(e) {
    e.preventDefault();
    const asunto = encodeURIComponent(`Consulta de evento — ${form.nombre || 'Sin nombre'}`);
    const cuerpo = encodeURIComponent(
      `Nombre: ${form.nombre}\nCorreo: ${form.correo}\nFecha tentativa: ${form.fecha}\nInvitados: ${form.invitados}\n\n${form.mensaje}`
    );
    window.location.href = `mailto:eventos@elfogon.com?subject=${asunto}&body=${cuerpo}`;
    setEnviado(true);
  }

  return (
    <div className="contenedor" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <span className="eyebrow">Eventos privados</span>
      <h1>Celebra tu ocasión especial con nosotros</h1>
      <p className="subtitulo-seccion">
        Nuestro Salón de Eventos y la Terraza reciben celebraciones de todo tipo, con menú
        personalizado, atención dedicada y espacio para hasta 20 personas.
      </p>

      <div className="rejilla" style={{ marginTop: 28 }}>
        {TIPOS_EVENTO.map((t) => (
          <div className="tarjeta" key={t.nombre}>
            <h3 style={{ fontSize: '1.1rem' }}>{t.nombre}</h3>
            <p style={{ color: 'var(--dorado)', fontWeight: 700, fontSize: '.82rem', textTransform: 'uppercase', margin: '4px 0' }}>
              {t.capacidad}
            </p>
            <p style={{ color: 'var(--texto-secundario)', fontSize: '.88rem', margin: 0 }}>Ambiente sugerido: {t.ambiente}</p>
            <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: '.87rem', color: 'var(--texto-secundario)' }}>
              {t.incluye.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <hr className="filete" />

      <span className="eyebrow">Nuestros espacios</span>
      <h2>Espacios disponibles para tu evento</h2>
      <div className="galeria-espacios" style={{ marginTop: 20 }}>
        {ambientes.map((a) => (
          <div className="tarjeta-evento" key={a.id_ambiente}>
            <div className={`espacio-visual ${a.imagen_url ? 'espacio-visual--foto' : ''}`}>
              {a.imagen_url && <img src={a.imagen_url} alt={a.nombre} loading="lazy" />}
            </div>
            <div className="contenido-evento">
              <h3 style={{ fontSize: '1rem' }}>{a.nombre}</h3>
              <p style={{ color: 'var(--texto-secundario)', fontSize: '.87rem', margin: 0 }}>
                {DESCRIPCION_ESPACIO[a.nombre] || a.horario_funcionamiento}
              </p>
            </div>
          </div>
        ))}
      </div>

      <hr className="filete" />

      <div className="tarjeta" style={{ maxWidth: 520 }}>
        <h3>Consulta por tu evento</h3>
        {enviado ? (
          <div className="mensaje-alerta mensaje-exito">
            Se abrió tu cliente de correo con la consulta lista para enviar. También puedes
            llamarnos directamente al 700-11122.
          </div>
        ) : (
          <form className="formulario" onSubmit={enviarConsulta}>
            <div className="campo">
              <label>Nombre</label>
              <input required value={form.nombre} onChange={(e) => actualizar('nombre', e.target.value)} />
            </div>
            <div className="campo">
              <label>Correo</label>
              <input type="email" required value={form.correo} onChange={(e) => actualizar('correo', e.target.value)} />
            </div>
            <div className="campo">
              <label>Fecha tentativa</label>
              <input type="date" value={form.fecha} onChange={(e) => actualizar('fecha', e.target.value)} />
            </div>
            <div className="campo">
              <label>Cantidad de invitados</label>
              <input type="number" min="1" value={form.invitados} onChange={(e) => actualizar('invitados', e.target.value)} />
            </div>
            <div className="campo">
              <label>Cuéntanos sobre tu evento</label>
              <textarea rows={3} value={form.mensaje} onChange={(e) => actualizar('mensaje', e.target.value)} />
            </div>
            <button className="boton boton-primario">Enviar consulta</button>
          </form>
        )}
      </div>
    </div>
  );
}
