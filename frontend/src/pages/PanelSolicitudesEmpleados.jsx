import { useEffect, useState } from 'react';
import api from '../services/api';
import Cargando from '../components/Cargando.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';
import { IconoAdvertencia, IconoCalendario } from '../components/Icons.jsx';

const ROLES = [
  { valor: 'staff', texto: 'Personal (acceso mínimo)' },
  { valor: 'salon', texto: 'Agente (salón / mesero)' },
  { valor: 'cocina', texto: 'Cocinero' },
  { valor: 'caja', texto: 'Caja' },
  { valor: 'almacen', texto: 'Almacén' },
  { valor: 'rrhh', texto: 'Recursos humanos' },
  { valor: 'admin', texto: 'Administrador' }
];

export default function PanelSolicitudesEmpleados() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [roles, setRoles] = useState({});
  const [motivos, setMotivos] = useState({});
  const [procesando, setProcesando] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  function cargar() {
    setCargando(true);
    api.get('/empleados', { params: { estado: 'Pendiente' } })
      .then((res) => setSolicitudes(res.data))
      .catch(() => setMensaje({ tipo: 'error', texto: 'No se pudieron cargar las solicitudes' }))
      .finally(() => setCargando(false));
  }
  useEffect(cargar, []);

  async function aprobar(id) {
    setProcesando(id);
    setMensaje(null);
    try {
      await api.patch(`/empleados/${id}/aprobar`, { rol: roles[id] || 'staff' });
      cargar();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.mensaje || 'No se pudo aprobar la solicitud' });
    } finally {
      setProcesando(null);
    }
  }

  async function rechazar(id) {
    setProcesando(id);
    setMensaje(null);
    try {
      await api.patch(`/empleados/${id}/rechazar`, { motivo: motivos[id] || '' });
      cargar();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.mensaje || 'No se pudo rechazar la solicitud' });
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="contenedor" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <h1>Solicitudes de personal</h1>
      <p className="subtitulo-seccion">
        Revisa a quienes se registraron para trabajar en El Fogón. Al aprobar con un rol, ya pueden
        iniciar sesión y van directo al panel de ese rol (por ejemplo, un agente de salón entra a
        "Reservas del salón" y un cocinero a "Productos").
      </p>

      {mensaje && (
        <div className="mensaje-alerta mensaje-error"><IconoAdvertencia /> {mensaje.texto}</div>
      )}

      {cargando && <Cargando texto="Cargando solicitudes…" />}

      {!cargando && solicitudes.length === 0 && (
        <EstadoVacio icono={IconoCalendario} titulo="No hay solicitudes pendientes" texto="Cuando alguien se registre como personal, aparecerá aquí." />
      )}

      {!cargando && solicitudes.length > 0 && (
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr><th>Nombre</th><th>CI</th><th>Correo</th><th>Teléfono</th><th>Rol a asignar</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => (
                <tr key={s.id_empleado}>
                  <td>{s.nombre} {s.apellidos}</td>
                  <td>{s.ci || '—'}</td>
                  <td>{s.correo_electronico}</td>
                  <td>{s.telefono || '—'}</td>
                  <td>
                    <select
                      value={roles[s.id_empleado] || 'staff'}
                      onChange={(e) => setRoles((r) => ({ ...r, [s.id_empleado]: e.target.value }))}
                    >
                      {ROLES.map((r) => <option key={r.valor} value={r.valor}>{r.texto}</option>)}
                    </select>
                  </td>
                  <td style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 200 }}>
                    <button
                      className="boton boton-primario"
                      disabled={procesando === s.id_empleado}
                      onClick={() => aprobar(s.id_empleado)}
                    >
                      Aprobar
                    </button>
                    <input
                      placeholder="Motivo del rechazo (opcional)"
                      value={motivos[s.id_empleado] || ''}
                      onChange={(e) => setMotivos((m) => ({ ...m, [s.id_empleado]: e.target.value }))}
                    />
                    <button
                      className="boton boton-peligro"
                      disabled={procesando === s.id_empleado}
                      onClick={() => rechazar(s.id_empleado)}
                    >
                      Rechazar
                    </button>
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
