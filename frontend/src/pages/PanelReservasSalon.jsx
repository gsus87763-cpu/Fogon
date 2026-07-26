import { useEffect, useState } from 'react';
import api from '../services/api';

export default function PanelReservasSalon() {
  const [reservas, setReservas] = useState([]);
  const [fecha, setFecha] = useState('');

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
            <tr><th>Fecha</th><th>Hora</th><th>Cliente</th><th>Mesa</th><th>Ambiente</th><th>Personas</th><th>Estado</th><th>Acciones</th></tr>
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
                <td style={{ display: 'flex', gap: 8 }}>
                  {r.estado === 'PENDIENTE' && (
                    <button className="boton boton-primario" onClick={() => confirmar(r.id_reserva)}>Confirmar</button>
                  )}
                  {['PENDIENTE', 'CONFIRMADA'].includes(r.estado) && (
                    <button className="boton boton-peligro" onClick={() => cancelar(r.id_reserva)}>Cancelar</button>
                  )}
                </td>
              </tr>
            ))}
            {reservas.length === 0 && <tr><td colSpan="8">No hay reservas para mostrar.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
