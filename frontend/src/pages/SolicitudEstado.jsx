import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IconoReloj, IconoAdvertencia, IconoCorreo } from '../components/Icons.jsx';

export default function SolicitudEstado() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Si alguien entra directo a esta URL sin haber intentado un login,
  // no hay nada que mostrar: lo mandamos de vuelta a iniciar sesión.
  if (!state?.estadoSolicitud) {
    return (
      <div className="contenedor" style={{ paddingTop: 60, textAlign: 'center' }}>
        <p>No encontramos información de una solicitud reciente.</p>
        <Link to="/login" className="boton boton-primario">Ir a iniciar sesión</Link>
      </div>
    );
  }

  const esPendiente = state.estadoSolicitud === 'PENDIENTE';

  return (
    <div className="contenedor" style={{ paddingTop: 60, paddingBottom: 60, display: 'flex', justifyContent: 'center' }}>
      <div className="tarjeta" style={{ maxWidth: 460, textAlign: 'center' }}>
        {esPendiente ? (
          <>
            <IconoReloj width="48" height="48" style={{ color: 'var(--color-primario, #7a1f1f)' }} />
            <h1 style={{ fontSize: '1.5rem', marginTop: 12 }}>Tu solicitud está en revisión</h1>
            <p style={{ color: 'var(--texto-secundario)' }}>
              Ya recibimos tus datos de postulación para trabajar en El Fogón. Un administrador la va
              a revisar y te vamos a avisar por correo apenas quede aprobada — recién ahí vas a poder
              iniciar sesión.
            </p>
          </>
        ) : (
          <>
            <IconoAdvertencia width="48" height="48" style={{ color: '#c0392b' }} />
            <h1 style={{ fontSize: '1.5rem', marginTop: 12 }}>Tu solicitud fue rechazada</h1>
            <p style={{ color: 'var(--texto-secundario)' }}>
              {state.motivo
                ? <>Motivo indicado por administración: <strong>{state.motivo}</strong></>
                : 'No se indicó un motivo específico.'}
            </p>
            <p style={{ color: 'var(--texto-secundario)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <IconoCorreo width="16" height="16" /> Si crees que es un error, contacta a administración.
            </p>
          </>
        )}
        <button className="boton boton-outline" style={{ marginTop: 16 }} onClick={() => navigate('/login')}>
          Volver al login
        </button>
      </div>
    </div>
  );
}
