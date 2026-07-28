import { useState } from 'react';
import api from '../services/api';
import { IconoAdvertencia, IconoCheck } from '../components/Icons.jsx';

// Palabras que ameritan una confirmación extra antes de ejecutar, porque
// modifican o destruyen datos/estructura. No bloquean nada: el backend
// también acepta estas sentencias (el rol admin tiene control total), esto
// solo evita un "clic accidental" sobre algo irreversible.
const PALABRAS_DESTRUCTIVAS = ['delete', 'update', 'drop', 'truncate', 'alter', 'insert', 'replace'];

const CONSULTAS_EJEMPLO = [
  { titulo: 'Clientes activos', sql: 'SELECT id_cliente, nombre, apellidos, correo FROM cliente WHERE activo = 1 LIMIT 50;' },
  { titulo: 'Mesas por ambiente', sql: 'SELECT a.nombre AS ambiente, m.id_mesa, m.capacidad_maxima, m.estado\nFROM mesa m\nJOIN ambiente a ON a.id_ambiente = m.id_ambiente\nORDER BY a.nombre;' },
  { titulo: 'Productos con poco stock', sql: 'SELECT id_producto, nombre, stock, id_almacen FROM producto WHERE stock < 10 ORDER BY stock ASC;' },
  { titulo: 'Reservas de hoy', sql: "SELECT * FROM reserva WHERE fecha = CURDATE();" }
];

function esDestructiva(sql) {
  const primeraPalabra = sql.trim().split(/\s+/)[0]?.toLowerCase() || '';
  return PALABRAS_DESTRUCTIVAS.includes(primeraPalabra);
}

export default function PanelConsultas() {
  const [sql, setSql] = useState('');
  const [ejecutando, setEjecutando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [historial, setHistorial] = useState([]);

  async function ejecutar(e) {
    e?.preventDefault();
    if (!sql.trim()) return;

    if (esDestructiva(sql) && !confirm('Esta consulta modifica o elimina datos/estructura de la base de datos de Railway. ¿Continuar?')) {
      return;
    }

    setEjecutando(true);
    setMensaje(null);
    setResultado(null);
    try {
      const res = await api.post('/admin-consultas/ejecutar', { sql });
      setResultado(res.data);
      setHistorial((h) => [{ sql, exito: true, fecha: new Date() }, ...h].slice(0, 15));
      if (res.data.tipo === 'resultado') {
        setMensaje({ tipo: 'exito', texto: `${res.data.mensaje} (${res.data.filasAfectadas ?? 0} fila(s) afectada(s))` });
      }
    } catch (err) {
      const texto = err.response?.data?.mensaje || 'Error al ejecutar la consulta';
      setMensaje({ tipo: 'error', texto });
      setHistorial((h) => [{ sql, exito: false, fecha: new Date() }, ...h].slice(0, 15));
    } finally {
      setEjecutando(false);
    }
  }

  function usarEjemplo(texto) {
    setSql(texto);
    setResultado(null);
    setMensaje(null);
  }

  function manejarTab(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd, value } = e.target;
      const nuevo = value.slice(0, selectionStart) + '  ' + value.slice(selectionEnd);
      setSql(nuevo);
      requestAnimationFrame(() => {
        e.target.selectionStart = e.target.selectionEnd = selectionStart + 2;
      });
    }
  }

  return (
    <div className="contenedor" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="panel-encabezado">
        <div>
          <h1>Consola de consultas SQL</h1>
          <p style={{ color: 'var(--texto-secundario)', margin: 0 }}>
            Ejecuta consultas directamente sobre la base de datos MySQL de Railway. Solo disponible para admin.
          </p>
        </div>
      </div>

      {mensaje && (
        <div className={`mensaje-alerta ${mensaje.tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error'}`} style={{ margin: '16px 0' }}>
          {mensaje.tipo === 'exito' ? <IconoCheck /> : <IconoAdvertencia />} {mensaje.texto}
        </div>
      )}

      <div className="tarjeta" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {CONSULTAS_EJEMPLO.map((ej) => (
            <button key={ej.titulo} type="button" className="boton boton-outline" onClick={() => usarEjemplo(ej.sql)}>
              {ej.titulo}
            </button>
          ))}
        </div>

        <form onSubmit={ejecutar}>
          <div className="campo" style={{ margin: 0 }}>
            <label>Sentencia SQL</label>
            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              onKeyDown={manejarTab}
              rows={8}
              spellCheck={false}
              placeholder="SELECT * FROM cliente LIMIT 20;"
              style={{ fontFamily: 'monospace', fontSize: '.9rem', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button className="boton boton-primario" disabled={ejecutando || !sql.trim()}>
              {ejecutando ? 'Ejecutando…' : 'Ejecutar consulta'}
            </button>
            <button type="button" className="boton boton-outline" onClick={() => { setSql(''); setResultado(null); setMensaje(null); }}>
              Limpiar
            </button>
          </div>
        </form>
      </div>

      {resultado?.tipo === 'filas' && (
        <div className="tarjeta" style={{ marginBottom: 18 }}>
          <p style={{ color: 'var(--texto-secundario)', marginTop: 0 }}>
            {resultado.totalFilas} fila(s) · {resultado.duracionMs} ms
          </p>
          {resultado.filas.length === 0 ? (
            <p>La consulta no devolvió filas.</p>
          ) : (
            <div className="tabla-envoltorio">
              <table className="tabla">
                <thead>
                  <tr>{resultado.columnas.map((c) => <th key={c}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {resultado.filas.map((fila, idx) => (
                    <tr key={idx}>
                      {resultado.columnas.map((c) => (
                        <td key={c}>{typeof fila[c] === 'boolean' ? (fila[c] ? 'Sí' : 'No') : String(fila[c] ?? '—')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {historial.length > 0 && (
        <div className="tarjeta">
          <h3 style={{ marginTop: 0 }}>Historial reciente</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {historial.map((h, idx) => (
              <li key={idx} style={{ marginBottom: 8 }}>
                <button
                  type="button"
                  onClick={() => usarEjemplo(h.sql)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    fontSize: '.85rem',
                    color: h.exito ? 'var(--texto-exito, inherit)' : 'var(--texto-peligro, inherit)',
                    textAlign: 'left'
                  }}
                  title="Volver a usar esta consulta"
                >
                  {h.sql.length > 100 ? h.sql.slice(0, 100) + '…' : h.sql}
                </button>
                <span style={{ color: 'var(--texto-secundario)', fontSize: '.78rem', marginLeft: 8 }}>
                  {h.fecha.toLocaleTimeString('es-BO')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
