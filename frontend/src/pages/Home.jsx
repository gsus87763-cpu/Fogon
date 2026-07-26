import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Cargando from '../components/Cargando.jsx';
import { IconoTrigo, IconoFuego, IconoPersona, IconoSilla, IconoEstrella, IconoUbicacion, IconoReloj, IconoTelefono, IconoCalendario } from '../components/Icons.jsx';

const PROPUESTA = [
  { Icono: IconoTrigo, titulo: 'Ingredientes de temporada', texto: 'Trabajamos con proveedores locales y una carta que cambia según lo mejor de cada estación.' },
  { Icono: IconoFuego, titulo: 'Cocina de fuego lento', texto: 'Técnicas de parrilla y cocción lenta que respetan el sabor original de cada producto.' },
  { Icono: IconoPersona, titulo: 'Chef y equipo certificado', texto: 'Nuestra cocina está a cargo de personal con certificaciones vigentes en manipulación e higiene.' },
  { Icono: IconoSilla, titulo: 'Experiencia completa', texto: 'Del salón a la terraza, cada ambiente está pensado para una ocasión distinta.' }
];

const TEXTO_AMBIENTE = {
  'Salón Principal': 'Nuestro espacio insignia, cálido y con vista a la cocina abierta. Ideal para cenas y almuerzos ejecutivos.',
  'Terraza': 'Ambiente al aire libre, perfecto para las tardes soleadas y reuniones informales entre amigos.',
  'Salón de Eventos': 'Espacio privado para hasta 20 personas, con menú personalizado para tu celebración.'
};

const TESTIMONIOS = [
  { texto: 'La parrillada para compartir es espectacular y el servicio se siente genuinamente atento, no apurado.', autor: 'Paola G., comensal frecuente', calificacion: 5 },
  { texto: 'Reservamos el salón de eventos para un cumpleaños y superó lo que esperábamos, hasta el detalle del menú.', autor: 'Sergio A.', calificacion: 5 },
  { texto: 'Se nota el cuidado en cada plato. La sopa de maní sabe a receta de casa, no a restaurante.', autor: 'Cliente de El Fogón', calificacion: 4 }
];

const PASOS_RESERVA = [
  { titulo: 'Elige fecha y hora', texto: 'Selecciona el día, la hora y cuántas personas van a la mesa.' },
  { titulo: 'Anticipa tus platos', texto: 'Opcional: agrega desde la Carta los platos que quieras reservar de antemano.' },
  { titulo: 'Recibe confirmación', texto: 'El salón confirma tu reserva y la gestionas desde tu panel cuando quieras.' }
];

export default function Home() {
  const [destacados, setDestacados] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/productos')
      .then((res) => setDestacados(res.data.slice(0, 6)))
      .finally(() => setCargando(false));
    api.get('/ambientes').then((res) => setAmbientes(res.data));
  }, []);

  return (
    <div>
      <section className="hero hero--completo">
        <div className="hero__imagen-fondo" aria-hidden="true" />
        <div className="hero-contenido">
          <div className="hero-linea-dorada" />
          <h1>Cocina de fuego lento, sabor de casa</h1>
          <p>
            En El Fogón combinamos recetas bolivianas de siempre con técnica de cocina
            contemporánea. Salón principal, terraza y salón de eventos para cada ocasión.
          </p>
          <div className="hero-botones">
            <Link to="/reservas" className="boton boton-primario">Reservar una mesa</Link>
            <Link to="/carta" className="boton boton-secundario">Ver la carta</Link>
          </div>

          <div className="hero__stats">
            <div><strong>18+</strong><span>platos en carta</span></div>
            <div><strong>3</strong><span>ambientes distintos</span></div>
            <div><strong>100%</strong><span>reserva en línea</span></div>
          </div>
        </div>
        <div className="hero__scroll-cue" aria-hidden="true" />
      </section>

      {/* --- Nuestra propuesta --- */}
      <section className="seccion contenedor">
        <span className="eyebrow">Nuestra propuesta</span>
        <h2>Por qué comer en El Fogón</h2>
        <p className="subtitulo-seccion">
          Cuatro ideas simples guían todo lo que sale de nuestra cocina, desde el almacén hasta tu mesa.
        </p>
        <div className="rejilla-4" style={{ marginTop: 26 }}>
          {PROPUESTA.map((p, i) => (
            <div className={`tarjeta aparecer aparecer-${i + 1}`} key={p.titulo}>
              <p.Icono width="26" height="26" style={{ color: 'var(--dorado)', marginBottom: 10 }} />
              <h3 style={{ fontSize: '1.05rem' }}>{p.titulo}</h3>
              <p style={{ color: 'var(--texto-secundario)', fontSize: '.9rem', margin: 0 }}>{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Platos destacados (desde la API) --- */}
      <section className="seccion seccion-oscura">
        <div className="contenedor">
          <span className="eyebrow">De la carta</span>
          <h2>Platos destacados</h2>
          <p className="subtitulo-seccion">Una probadita de lo que encontrarás hoy en nuestra carta de temporada.</p>

          <div style={{ marginTop: 26 }}>
            {cargando && <Cargando texto="Cargando platos destacados…" />}
            {!cargando && (
              <div className="rejilla">
                {destacados.map((p) => {
                  const imagen = p.imagen_url;
                  return (
                    <article className="tarjeta-producto" key={p.id_producto}>
                      <div className={`tarjeta-producto__media ${imagen ? '' : 'tarjeta-producto__media--textura'}`}>
                        {imagen && <img src={imagen} alt={p.nombre} loading="lazy" />}
                      </div>
                      <div className="tarjeta-producto__cuerpo">
                        <span className="categoria-chip">{p.categoria}</span>
                        <h3><span>{p.nombre}</span><span className="precio">Bs {Number(p.precio).toFixed(2)}</span></h3>
                        <p>{p.descripcion || 'Preparado con ingredientes seleccionados de temporada.'}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
            {!cargando && destacados.length === 0 && (
              <p style={{ color: 'var(--texto-secundario-oscuro)' }}>Muy pronto publicaremos los platos de esta temporada.</p>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: 34 }}>
            <Link to="/carta" className="boton boton-secundario">Ver la carta completa</Link>
          </div>
        </div>
      </section>

      {/* --- Ambientes --- */}
      <section className="seccion contenedor">
        <span className="eyebrow">Nuestros espacios</span>
        <h2>Un ambiente para cada ocasión</h2>
        <div className="galeria-espacios" style={{ marginTop: 26 }}>
          {ambientes.map((a) => (
            <div className="tarjeta-evento" key={a.id_ambiente}>
              <div className={`espacio-visual ${a.imagen_url ? 'espacio-visual--foto' : ''}`}>
                {a.imagen_url && <img src={a.imagen_url} alt={a.nombre} loading="lazy" />}
              </div>
              <div className="contenido-evento">
                <h3 style={{ fontSize: '1.05rem' }}>{a.nombre}</h3>
                <p style={{ color: 'var(--texto-secundario)', fontSize: '.9rem', margin: 0 }}>
                  {TEXTO_AMBIENTE[a.nombre] || a.horario_funcionamiento}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Cómo reservar --- */}
      <section className="seccion contenedor">
        <span className="eyebrow">Cómo funciona</span>
        <h2>Reservar toma menos de dos minutos</h2>
        <p className="subtitulo-seccion">Sin llamadas, sin esperas: todo el proceso se hace en línea, de principio a fin.</p>
        <div className="pasos" style={{ marginTop: 26 }}>
          {PASOS_RESERVA.map((p, i) => (
            <div className="paso" key={p.titulo}>
              <div className="numero">{i + 1}</div>
              <h4>{p.titulo}</h4>
              <p>{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Testimonios --- */}
      <section className="seccion seccion-oscura">
        <div className="contenedor">
          <span className="eyebrow">Lo que dicen</span>
          <h2>Comensales que vuelven</h2>
          <div className="rejilla" style={{ marginTop: 24 }}>
            {TESTIMONIOS.map((t) => (
              <div className="testimonio" key={t.autor}>
                <div className="testimonio__estrellas">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <IconoEstrella key={i} style={{ opacity: i < t.calificacion ? 1 : .25 }} />
                  ))}
                </div>
                <p className="cita">{t.texto}</p>
                <p className="autor">{t.autor}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Visítanos --- */}
      <section className="visitanos">
        <div className="visitanos__imagen" aria-hidden="true" />
        <div className="contenedor visitanos__contenido">
          <span className="eyebrow">Visítanos</span>
          <h2>Te esperamos en Av. Arce 2100</h2>
          <div className="visitanos__datos">
            <div><IconoUbicacion width="20" height="20" /><span>Av. Arce 2100, La Paz</span></div>
            <div><IconoReloj width="20" height="20" /><span>Lun a dom, 12:00 – 23:00</span></div>
            <div><IconoTelefono width="20" height="20" /><a href="tel:+59170011122">700-11122</a></div>
          </div>
          <div className="hero-botones" style={{ justifyContent: 'flex-start', marginTop: 24 }}>
            <Link to="/reservas" className="boton boton-primario"><IconoCalendario width="16" height="16" /> Reservar mesa</Link>
          </div>
        </div>
      </section>

      {/* --- CTA final --- */}
      <section className="hero" style={{ padding: '64px 20px' }}>
        <div className="hero-contenido">
          <h2 style={{ color: 'var(--texto-claro)', fontSize: '1.9rem' }}>¿Listo para tu próxima mesa?</h2>
          <p style={{ margin: '10px auto 24px' }}>Reserva en línea o crea una cuenta para llevar el registro de tus visitas.</p>
          <div className="hero-botones">
            <Link to="/reservas" className="boton boton-primario">Reservar ahora</Link>
            <Link to="/registro" className="boton boton-secundario">Crear cuenta</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
