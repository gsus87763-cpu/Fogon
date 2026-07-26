import { Link } from 'react-router-dom';
import {
  IconoUbicacion, IconoTelefono, IconoReloj, IconoFlechaArriba,
  IconoWhatsapp, IconoCorreo, IconoInstagram, IconoFacebook
} from './Icons.jsx';

const EQUIPO_DESARROLLO = [
  'Nicole Belén Terán Quiroga',
  'Edwin Dylan Salazar Cruz',
  'Josué Alejandro Terrazas Ramos',
  'Marcelo Jesús Villalobos Cerrillo'
];

const HORARIO = [
  { dias: 'Lunes a jueves', horas: '12:00 – 22:00' },
  { dias: 'Viernes y sábado', horas: '12:00 – 23:30' },
  { dias: 'Domingo', horas: '12:00 – 21:00' }
];

const REDES = [
  { nombre: 'WhatsApp', href: 'https://wa.me/59170011122', Icono: IconoWhatsapp },
  { nombre: 'Instagram', href: 'https://instagram.com/elfogon.bo', Icono: IconoInstagram },
  { nombre: 'Facebook', href: 'https://facebook.com/elfogon.bo', Icono: IconoFacebook }
];

export default function Footer() {
  function volverArriba() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <footer className="pie-premium">
      <div className="pie-premium__glow" aria-hidden="true" />

      <div className="pie-premium__contenido">
        <div className="pie-premium__grid pie-premium__grid--5">
          {/* Marca */}
          <div className="pie-premium__marca-bloque">
            <Link to="/" className="pie-premium__logo">El Fogón</Link>
            <p className="pie-premium__tagline">
              Cocina de fuego lento y sabor de casa, en un ambiente pensado para cada ocasión.
            </p>
            <div className="pie-premium__redes">
              {REDES.map(({ nombre, href, Icono }) => (
                <a key={nombre} href={href} target="_blank" rel="noopener noreferrer" className="pie-premium__red" aria-label={nombre} title={nombre}>
                  <Icono />
                </a>
              ))}
            </div>
          </div>

          {/* Contacto */}
          <div className="pie-premium__col">
            <h3>Contacto</h3>
            <ul className="pie-premium__contacto">
              <li><IconoUbicacion /><span>Av. Arce 2100, La Paz</span></li>
              <li><IconoTelefono /><a href="tel:+59170011122">700-11122</a></li>
              <li><IconoWhatsapp /><a href="https://wa.me/59170011122" target="_blank" rel="noopener noreferrer">WhatsApp directo</a></li>
              <li><IconoCorreo /><a href="mailto:contacto@elfogon.com">contacto@elfogon.com</a></li>
            </ul>
          </div>

          {/* Horario */}
          <div className="pie-premium__col">
            <h3>Horario</h3>
            <ul className="pie-premium__horario">
              {HORARIO.map((h) => (
                <li key={h.dias}><span>{h.dias}</span><span>{h.horas}</span></li>
              ))}
            </ul>
            <p className="pie-premium__nota"><IconoReloj /> Salón de eventos con reserva previa</p>
          </div>

          {/* Explorar */}
          <nav className="pie-premium__col" aria-label="Explorar el sitio">
            <h3>Explorar</h3>
            <ul>
              <li><Link to="/carta" className="pie-premium__enlace">Carta</Link></li>
              <li><Link to="/reservas" className="pie-premium__enlace">Reservas</Link></li>
              <li><Link to="/eventos" className="pie-premium__enlace">Eventos</Link></li>
              <li><Link to="/sobre-nosotros" className="pie-premium__enlace">Sobre nosotros</Link></li>
            </ul>
          </nav>

          {/* Cuenta */}
          <nav className="pie-premium__col" aria-label="Cuenta">
            <h3>Cuenta</h3>
            <ul>
              <li><Link to="/login" className="pie-premium__enlace">Iniciar sesión</Link></li>
              <li><Link to="/registro" className="pie-premium__enlace">Crear cuenta</Link></li>
              <li><Link to="/panel" className="pie-premium__enlace">Mi panel</Link></li>
            </ul>
          </nav>
        </div>

        <div className="pie-premium__divisor" />

        <div className="pie-premium__base">
          <p className="pie-premium__copy">© {new Date().getFullYear()} El Fogón. Todos los derechos reservados.</p>
          <button type="button" className="pie-premium__arriba" onClick={volverArriba}>
            <IconoFlechaArriba />
            Volver arriba
          </button>
        </div>

        <div className="pie-premium__creditos">
          <span className="pie-premium__creditos-etiqueta">Plataforma desarrollada por</span>
          {EQUIPO_DESARROLLO.map((nombre) => (
            <span className="pie-premium__chip" key={nombre}>{nombre}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}
