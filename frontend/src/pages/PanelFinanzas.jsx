import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { IconoAdvertencia, IconoCheck } from '../components/Icons.jsx';

const PESTAÑAS = [
  { clave: 'pagos', titulo: 'Pago Empleado' },
  { clave: 'facturas', titulo: 'Facturas' },
  { clave: 'compras', titulo: 'Detalle de Compra' }
];

function descargar(blob, nombreArchivo) {
  const url = window.URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  window.URL.revokeObjectURL(url);
}

export default function PanelFinanzas() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin';
  const [pestaña, setPestaña] = useState('pagos');
  const [pagos, setPagos] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [exportando, setExportando] = useState(false);

  const [formPago, setFormPago] = useState({ id_empleado: '', concepto: '', periodo: '', monto: '', fecha_pago: '' });
  const [formFactura, setFormFactura] = useState({ id_reserva: '', metodo_pago: 'EFECTIVO' });
  const [formCompra, setFormCompra] = useState({ id_almacen: '', proveedor: '', fecha_emision: '' });

  function cargarTodo() {
    api.get('/finanzas/pagos-empleado').then((res) => setPagos(res.data)).catch(() => {});
    api.get('/finanzas/facturas').then((res) => setFacturas(res.data)).catch(() => {});
    api.get('/finanzas/compras').then((res) => setCompras(res.data)).catch(() => {});
  }
  useEffect(cargarTodo, []);

  async function registrarPago(e) {
    e.preventDefault();
    setMensaje(null);
    try {
      await api.post('/finanzas/pagos-empleado', {
        ...formPago,
        id_empleado: Number(formPago.id_empleado),
        monto: Number(formPago.monto)
      });
      setMensaje({ tipo: 'exito', texto: 'Pago registrado' });
      setFormPago({ id_empleado: '', concepto: '', periodo: '', monto: '', fecha_pago: '' });
      cargarTodo();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.mensaje || 'Error al registrar el pago' });
    }
  }

  async function generarFactura(e) {
    e.preventDefault();
    setMensaje(null);
    try {
      await api.post('/finanzas/facturas', { ...formFactura, id_reserva: Number(formFactura.id_reserva) });
      setMensaje({ tipo: 'exito', texto: 'Factura generada' });
      setFormFactura({ id_reserva: '', metodo_pago: 'EFECTIVO' });
      cargarTodo();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.mensaje || 'Error al generar la factura' });
    }
  }

  async function crearCompra(e) {
    e.preventDefault();
    setMensaje(null);
    try {
      await api.post('/finanzas/compras', { ...formCompra, id_almacen: Number(formCompra.id_almacen), items: [] });
      setMensaje({ tipo: 'exito', texto: 'Compra registrada. Agrégale ítems desde el detalle.' });
      setFormCompra({ id_almacen: '', proveedor: '', fecha_emision: '' });
      cargarTodo();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.mensaje || 'Error al registrar la compra' });
    }
  }

  async function anularPago(id) {
    await api.patch(`/finanzas/pagos-empleado/${id}/anular`);
    cargarTodo();
  }
  async function anularFactura(id) {
    await api.patch(`/finanzas/facturas/${id}/anular`);
    cargarTodo();
  }

  async function exportar(formato) {
    setExportando(true);
    try {
      const res = await api.get(`/estadisticas/reportes/finanzas-${formato}`, { responseType: 'blob' });
      const tipo = formato === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      descargar(new Blob([res.data], { type: tipo }), `reporte_finanzas.${formato === 'pdf' ? 'pdf' : 'xlsx'}`);
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="contenedor" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="panel-encabezado">
        <h1>Finanzas</h1>
        {esAdmin && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="boton boton-outline" disabled={exportando} onClick={() => exportar('pdf')}>Exportar PDF</button>
            <button className="boton boton-outline" disabled={exportando} onClick={() => exportar('excel')}>Exportar Excel</button>
          </div>
        )}
      </div>

      {mensaje && (
        <div className={`mensaje-alerta ${mensaje.tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error'}`} style={{ marginBottom: 16 }}>
          {mensaje.tipo === 'exito' ? <IconoCheck /> : <IconoAdvertencia />} {mensaje.texto}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {PESTAÑAS.map((p) => (
          <button
            key={p.clave}
            className={pestaña === p.clave ? 'boton boton-primario' : 'boton boton-outline'}
            onClick={() => setPestaña(p.clave)}
          >
            {p.titulo}
          </button>
        ))}
      </div>

      {pestaña === 'pagos' && (
        <>
          <div className="tarjeta" style={{ marginBottom: 24 }}>
            <h3>Registrar pago a empleado</h3>
            <form className="formulario" onSubmit={registrarPago} style={{ maxWidth: 'none' }}>
              <div className="campo"><label>ID Empleado</label><input value={formPago.id_empleado} onChange={(e) => setFormPago((f) => ({ ...f, id_empleado: e.target.value }))} /></div>
              <div className="campo"><label>Concepto</label><input value={formPago.concepto} onChange={(e) => setFormPago((f) => ({ ...f, concepto: e.target.value }))} /></div>
              <div className="campo"><label>Periodo</label><input placeholder="Ej. Julio 2026" value={formPago.periodo} onChange={(e) => setFormPago((f) => ({ ...f, periodo: e.target.value }))} /></div>
              <div className="campo"><label>Monto (Bs)</label><input type="number" step="0.01" value={formPago.monto} onChange={(e) => setFormPago((f) => ({ ...f, monto: e.target.value }))} /></div>
              <div className="campo"><label>Fecha de pago</label><input type="date" value={formPago.fecha_pago} onChange={(e) => setFormPago((f) => ({ ...f, fecha_pago: e.target.value }))} /></div>
              <button className="boton boton-primario">Registrar pago</button>
            </form>
          </div>
          <div className="tabla-envoltorio">
            <table className="tabla">
              <thead><tr><th>ID</th><th>Empleado</th><th>Concepto</th><th>Periodo</th><th>Monto (Bs)</th><th>Fecha</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {pagos.map((p) => (
                  <tr key={p.id_pago}>
                    <td>{p.id_pago}</td><td>{p.empleado}</td><td>{p.concepto}</td><td>{p.periodo || '—'}</td>
                    <td>{Number(p.monto).toFixed(2)}</td><td>{p.fecha_pago}</td><td>{p.estado}</td>
                    <td>{p.estado !== 'ANULADO' && esAdmin && <button className="boton boton-outline" onClick={() => anularPago(p.id_pago)}>Anular</button>}</td>
                  </tr>
                ))}
                {pagos.length === 0 && <tr><td colSpan={8}>Sin pagos registrados.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {pestaña === 'facturas' && (
        <>
          <div className="tarjeta" style={{ marginBottom: 24 }}>
            <h3>Generar factura desde una reserva</h3>
            <form className="formulario" onSubmit={generarFactura} style={{ maxWidth: 'none' }}>
              <div className="campo"><label>ID Reserva</label><input value={formFactura.id_reserva} onChange={(e) => setFormFactura((f) => ({ ...f, id_reserva: e.target.value }))} /></div>
              <div className="campo">
                <label>Método de pago</label>
                <select value={formFactura.metodo_pago} onChange={(e) => setFormFactura((f) => ({ ...f, metodo_pago: e.target.value }))}>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TARJETA">Tarjeta</option>
                  <option value="QR">QR</option>
                </select>
              </div>
              <button className="boton boton-primario">Generar factura</button>
            </form>
          </div>
          <div className="tabla-envoltorio">
            <table className="tabla">
              <thead><tr><th>N° Factura</th><th>Cliente</th><th>Fecha</th><th>Monto (Bs)</th><th>Método</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {facturas.map((f) => (
                  <tr key={f.id_factura}>
                    <td>{f.numero_factura}</td><td>{f.cliente}</td><td>{f.fecha_emision}</td>
                    <td>{Number(f.monto_total).toFixed(2)}</td><td>{f.metodo_pago}</td><td>{f.estado}</td>
                    <td>{f.estado !== 'ANULADA' && esAdmin && <button className="boton boton-outline" onClick={() => anularFactura(f.id_factura)}>Anular</button>}</td>
                  </tr>
                ))}
                {facturas.length === 0 && <tr><td colSpan={7}>Sin facturas registradas.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {pestaña === 'compras' && (
        <>
          <div className="tarjeta" style={{ marginBottom: 24 }}>
            <h3>Registrar compra a almacén</h3>
            <form className="formulario" onSubmit={crearCompra} style={{ maxWidth: 'none' }}>
              <div className="campo"><label>ID Almacén</label><input value={formCompra.id_almacen} onChange={(e) => setFormCompra((f) => ({ ...f, id_almacen: e.target.value }))} /></div>
              <div className="campo"><label>Proveedor</label><input value={formCompra.proveedor} onChange={(e) => setFormCompra((f) => ({ ...f, proveedor: e.target.value }))} /></div>
              <div className="campo"><label>Fecha de emisión</label><input type="date" value={formCompra.fecha_emision} onChange={(e) => setFormCompra((f) => ({ ...f, fecha_emision: e.target.value }))} /></div>
              <button className="boton boton-primario">Registrar compra</button>
            </form>
            <p style={{ fontSize: '.85rem', color: 'var(--texto-secundario)' }}>
              Crea primero la cabecera de la compra; los ítems (descripción, cantidad, precio) se agregan luego con el
              botón "Detalle" de la tabla — el monto total se recalcula solo.
            </p>
          </div>
          <div className="tabla-envoltorio">
            <table className="tabla">
              <thead><tr><th>ID</th><th>Almacén</th><th>Proveedor</th><th>Fecha</th><th>Monto (Bs)</th><th>Ítems</th></tr></thead>
              <tbody>
                {compras.map((c) => (
                  <tr key={c.id_detalle}>
                    <td>{c.id_detalle}</td><td>{c.almacen}</td><td>{c.proveedor}</td><td>{c.fecha_emision}</td>
                    <td>{Number(c.monto).toFixed(2)}</td><td>{c.items?.length || 0}</td>
                  </tr>
                ))}
                {compras.length === 0 && <tr><td colSpan={6}>Sin compras registradas.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
