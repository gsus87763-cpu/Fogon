import { useEffect, useState } from 'react';
import api from '../services/api';

const ESTADO_PAGO_TEXTO = {
  PENDIENTE: 'Pendiente',
  APROBADO: 'Pagado',
  RECHAZADO: 'Rechazado'
};

export default function PanelReservasSalon() {
  const [reservas, setReservas] = useState([]);
  const [fecha, setFecha] = useState('');
  const [codigos, setCodigos] = useState({});
  const [procesando, setProcesando] = useState(null);
  const [errores, setErrores] = useState({});

  function cargar() {
    api.get('/reservas', { params: fecha ? { fecha } : {} }).then((res) => setReservas(res.data));
  }
  useEffect(cargar, [fecha]);

  async function confirmar(id) {
    await api.patch(`/reservas/${id}/confirmar`);
    cargar();
  }
  async function cancelar(id) {
    await api.patch(`/reservas/${id}/cancelar`);
    cargar();
  }

  async function resolverPago(id, aprobar) {
    const codigo = (codigos[id] || '').trim();
    setErrores((e) => ({ ...e, [id]: null }));
    if (!codigo) {
      setErrores((e) => ({ ...e, [id]: 'Escribe o escanea el código del QR' }));
      return;
    }
    setProcesando(id);
    try {
      await api.post(`/reservas/${id}/pago/resolver`, { codigo, aprobar });
      setCodigos((c) => ({ ...c, [id]: '' }));
      cargar();
    } catch (err) {
      setErrores((e) => ({ ...e, [id]: err.response?.data?.mensaje || 'No se pudo procesar el pago' }));
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="contenedor" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="panel-encabezado">
        <h1>Reservas del salón</h1>
        <div className="campo" style={{ maxWidth: 200 }}>
          <label>Filtrar por fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
      </div>

      <div className="tabla-envoltorio">
        <table className="tabla">
          <thead>
            <tr>
              <th>Fecha</th><th>Hora</th><th>Cliente</th><th>Mesa</th><th>Ambiente</th>
              <th>Personas</th><th>Estado</th><th>Pago</th><th>Verificar QR de pago</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((r) => (
              <tr key={r.id_reserva}>
                <td>{r.fecha}</td>
                <td>{r.hora}</td>
                <td>{r.cliente}</td>
                <td>{r.numero_mesa}</td>
                <td>{r.ambiente}</td>
                <td>{r.cantidad_personas}</td>
                <td>{r.estado}</td>
                <td>
                  {r.pago ? (
                    <>
                      {ESTADO_PAGO_TEXTO[r.pago.estado]}<br />
                      <small>Bs {Number(r.pago.monto).toFixed(2)}</small>
                    </>
                  ) : '—'}
                </td>
                <td>
                  {r.estado === 'PENDIENTE' && r.pago?.estado === 'PENDIENTE' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 180 }}>
                      <input
                        placeholder="Código del QR (FOGON-XXXX)"
                        value={codigos[r.id_reserva] || ''}
                        onChange={(e) => setCodigos((c) => ({ ...c, [r.id_reserva]: e.target.value }))}
                      />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="boton boton-primario"
                          disabled={procesando === r.id_reserva}
                          onClick={() => resolverPago(r.id_reserva, true)}
                        >
                          Aprobar
                        </button>
                        <button
                          className="boton boton-peligro"
                          disabled={procesando === r.id_reserva}
                          onClick={() => resolverPago(r.id_reserva, false)}
                        >
                          Rechazar
                        </button>
                      </div>
                      {errores[r.id_reserva] && (
                        <small style={{ color: 'var(--color-peligro, #c0392b)' }}>{errores[r.id_reserva]}</small>
                      )}
                    </div>
                  ) : '—'}
                </td>
                <td style={{ display: 'flex', gap: 8 }}>
                  {r.estado === 'PENDIENTE' && (
                    <button className="boton boton-outline" onClick={() => confirmar(r.id_reserva)}>
                      Confirmar sin QR
                    </button>
                  )}
                  {['PENDIENTE', 'CONFIRMADA'].includes(r.estado) && (
                    <button className="boton boton-peligro" onClick={() => cancelar(r.id_reserva)}>Cancelar</button>
                  )}
                </td>
              </tr>
            ))}
            {reservas.length === 0 && <tr><td colSpan="10">No hay reservas para mostrar.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
