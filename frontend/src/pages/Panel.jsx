import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ACCESOS_POR_ROL = {
  admin: [
    { to: '/panel/tablas', titulo: 'Todas las tablas', desc: 'Ver, crear, editar y eliminar cualquier tabla de la BD, con exportación a Excel y PDF' },
    { to: '/panel/productos', titulo: 'Carta / Productos', desc: 'CRUD con eliminación lógica' },
    { to: '/panel/reservas-salon', titulo: 'Reservas y mesas', desc: 'Confirmar o revisar reservas' },
    { to: '/panel/estadisticas', titulo: 'Reportes y estadísticas', desc: 'Gráficos y reporte PDF' },
    { to: '/panel/clientes', titulo: 'Clientes', desc: 'Gestionar cuentas de clientes' },
    { to: '/panel/ambientes', titulo: 'Ambientes', desc: 'Gestionar salones y ambientes' },
    { to: '/panel/finanzas', titulo: 'Finanzas', desc: 'Pagos, facturas y compras' },
    { to: '/panel/consultas', titulo: 'Consultas SQL', desc: 'Ejecutar consultas directas sobre la BD de Railway' }
  ],
  salon: [
    { to: '/panel/reservas-salon', titulo: 'Reservas y mesas', desc: 'Confirmar reservas del día' }
  ],
  cocina: [
    { to: '/panel/productos', titulo: 'Carta / Productos', desc: 'Mantener platos y precios' },
    { to: '/panel/tablas', titulo: 'Mis tablas', desc: 'Cocinero, certificaciones, cocina, asistencia y producto emplatado' }
  ],
  almacen: [
    { to: '/panel/productos', titulo: 'Carta / Productos', desc: 'Consultar disponibilidad de platos' },
    { to: '/panel/tablas', titulo: 'Mis tablas', desc: 'Almacén, producto y compras' }
  ],
  caja: [
    { to: '/panel/estadisticas', titulo: 'Reportes y estadísticas', desc: 'Ingresos y reporte PDF' },
    { to: '/panel/finanzas', titulo: 'Finanzas', desc: 'Pagos, facturas y compras' },
    { to: '/panel/tablas', titulo: 'Mis tablas', desc: 'Pedidos, facturas y clientes' }
  ],
  staff: [
    { to: '/panel/tablas', titulo: 'Mi asistencia', desc: 'Registrar y ver tu asistencia' }
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
