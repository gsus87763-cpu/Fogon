import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ACCESOS_POR_ROL = {
  admin: [
    { to: '/panel/productos', titulo: 'Carta / Productos', desc: 'CRUD con eliminación lógica' },
    { to: '/panel/reservas-salon', titulo: 'Reservas y mesas', desc: 'Confirmar o revisar reservas' },
    { to: '/panel/estadisticas', titulo: 'Reportes y estadísticas', desc: 'Gráficos y reporte PDF' }
  ],
  salon: [
    { to: '/panel/reservas-salon', titulo: 'Reservas y mesas', desc: 'Confirmar reservas del día' }
  ],
  cocina: [
    { to: '/panel/productos', titulo: 'Carta / Productos', desc: 'Mantener platos y precios' }
  ],
  almacen: [
    { to: '/panel/productos', titulo: 'Carta / Productos', desc: 'Consultar disponibilidad de platos' }
  ],
  caja: [
    { to: '/panel/estadisticas', titulo: 'Reportes y estadísticas', desc: 'Ingresos y reporte PDF' }
  ],
  cliente: [
    { to: '/reservas', titulo: 'Mis reservas', desc: 'Ver, crear o cancelar reservas' }
  ]
};

export default function Panel() {
  const { usuario } = useAuth();
  const accesos = ACCESOS_POR_ROL[usuario.rol] || [];

  return (
    <div className="contenedor" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <h1>Hola, {usuario.nombre}</h1>
      <p style={{ color: 'var(--texto-secundario)' }}>Rol: {usuario.rol}</p>

      <div className="rejilla" style={{ marginTop: 20 }}>
        {accesos.map((a) => (
          <Link key={a.to} to={a.to} className="tarjeta" style={{ textDecoration: 'none' }}>
            <h3>{a.titulo}</h3>
            <p style={{ color: 'var(--texto-secundario)' }}>{a.desc}</p>
          </Link>
        ))}
        {accesos.length === 0 && <p>No hay accesos configurados para este rol todavía.</p>}
      </div>
    </div>
  );
}
