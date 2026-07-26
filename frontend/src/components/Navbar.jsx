import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useCarrito } from '../context/CarritoContext.jsx';
import { IconoMenu, IconoCerrar, IconoSol, IconoLuna, IconoCarrito } from './Icons.jsx';

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);
  const [conFondo, setConFondo] = useState(false);
  const { usuario, cerrarSesion } = useAuth();
  const { tema, alternarTema } = useTheme();
  const { totalItems } = useCarrito();
  const navigate = useNavigate();
  const location = useLocation();

  // En Inicio, el hero es de pantalla completa: la nav empieza transparente
  // y aparece con fondo apenas el usuario hace scroll. En el resto de páginas
  // siempre lleva fondo, porque no hay un hero oscuro debajo que la sostenga.
  const enHeroCompleto = location.pathname === '/';

  useEffect(() => {
    function alScroll() {
      setConFondo(window.scrollY > (enHeroCompleto ? window.innerHeight * 0.72 : 8));
    }
    alScroll();
    window.addEventListener('scroll', alScroll, { passive: true });
    return () => window.removeEventListener('scroll', alScroll);
  }, [enHeroCompleto]);

  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [abierto]);

  async function salir() {
    await cerrarSesion();
    setAbierto(false);
    navigate('/');
  }

  function enlaceClase({ isActive }) {
    return `nav-premium__enlace${isActive ? ' activo' : ''}`;
  }

  return (
    <nav className={`nav-premium ${conFondo ? 'nav-premium--con-fondo' : ''} ${enHeroCompleto && !conFondo ? 'nav-premium--transparente' : ''}`}>
      <div className="nav-premium__interna">
        <NavLink to="/" className="nav-premium__marca" onClick={() => setAbierto(false)}>El Fogón</NavLink>

        <button
          className="nav-premium__hamburguesa"
          onClick={() => setAbierto((v) => !v)}
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
          aria-controls="menu-principal"
        >
          {abierto ? <IconoCerrar /> : <IconoMenu />}
        </button>

        <div id="menu-principal" className={`nav-premium__enlaces ${abierto ? 'nav-premium__enlaces--abierto' : ''}`}>
          <NavLink to="/carta" className={enlaceClase} onClick={() => setAbierto(false)}>Carta</NavLink>
          <NavLink to="/reservas" className={enlaceClase} onClick={() => setAbierto(false)}>Reservas</NavLink>
          <NavLink to="/eventos" className={enlaceClase} onClick={() => setAbierto(false)}>Eventos</NavLink>
          <NavLink to="/sobre-nosotros" className={enlaceClase} onClick={() => setAbierto(false)}>Sobre nosotros</NavLink>

          <button
            className="boton-tema"
            onClick={alternarTema}
            aria-label={tema === 'claro' ? 'Activar modo oscuro' : 'Activar modo claro'}
            title={tema === 'claro' ? 'Modo oscuro' : 'Modo claro'}
          >
            {tema === 'claro' ? <IconoLuna /> : <IconoSol />}
          </button>

          <NavLink to="/reservas" className="nav-premium__icono-carrito" onClick={() => setAbierto(false)} aria-label="Carrito de reserva">
            <IconoCarrito />
            {totalItems > 0 && <span className="nav-premium__contador-carrito nav-premium__contador-carrito--flotante">{totalItems}</span>}
          </NavLink>

          {!usuario && (
            <NavLink to="/login" className="nav-premium__cta" onClick={() => setAbierto(false)}>
              Iniciar sesión
            </NavLink>
          )}

          {usuario && (
            <div className="nav-premium__cuenta">
              <NavLink to="/panel" className={enlaceClase} onClick={() => setAbierto(false)}>Mi panel</NavLink>
              <button className="nav-premium__salir" onClick={salir}>Salir</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
