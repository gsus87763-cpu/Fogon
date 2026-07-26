import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../services/api';

export default function PanelEstadisticas() {
  const [datos, setDatos] = useState([]);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    api.get('/estadisticas/reservas-por-dia').then((res) => setDatos(res.data));
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    setDesde(inicioMes.toISOString().slice(0, 10));
    setHasta(hoy.toISOString().slice(0, 10));
  }, []);

  async function descargarPdf() {
    setDescargando(true);
    try {
      const res = await api.get('/estadisticas/reportes/reservas-pdf', {
        params: { desde, hasta },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `reporte_reservas_${desde}_a_${hasta}.pdf`;
      enlace.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setDescargando(false);
    }
  }

  return (
    <div className="contenedor" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <h1>Reportes y estadísticas</h1>

      <div className="tarjeta" style={{ marginBottom: 30 }}>
        <h3>Reservas por día (últimos 14 días)</h3>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={datos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee2d0" />
              <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total_reservas" fill="#c9922a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tarjeta">
        <h3>Reporte PDF de reservas por periodo</h3>
        <div className="formulario" style={{ maxWidth: 500 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="campo">
              <label>Desde</label>
              <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
            </div>
            <div className="campo">
              <label>Hasta</label>
              <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </div>
          </div>
          <button className="boton boton-primario" onClick={descargarPdf} disabled={descargando}>
            {descargando ? 'Generando…' : 'Descargar PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
