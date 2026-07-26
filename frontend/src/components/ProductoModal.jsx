import { useEffect, useState } from 'react';
import { IconoCerrar, IconoMas, IconoMenos, IconoCarrito } from './Icons.jsx';
import { useCarrito } from '../context/CarritoContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProductoModal({ producto, onClose }) {
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const { agregar } = useCarrito();
  const { usuario } = useAuth();

  useEffect(() => {
    function alEscape(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', alEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!producto) return null;

  const sinCupo = producto.disponible_hoy != null && producto.disponible_hoy <= 0;
  const maximo = producto.disponible_hoy != null ? producto.disponible_hoy : 99;

  function agregarAlCarrito() {
    agregar(producto, cantidad);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1800);
  }

  return (
    <div className="modal-fondo" onClick={onClose}>
      <div className="modal-producto aparecer" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={producto.nombre}>
        <button className="modal-producto__cerrar" onClick={onClose} aria-label="Cerrar">
          <IconoCerrar />
        </button>

        <div className={`modal-producto__media ${producto.imagen_url ? '' : 'modal-producto__media--textura'}`}>
          {producto.imagen_url && <img src={producto.imagen_url} alt={producto.nombre} />}
        </div>

        <div className="modal-producto__cuerpo">
          <span className="categoria-chip">{producto.categoria}</span>
          <h2>{producto.nombre}</h2>
          <p className="modal-producto__precio">Bs {Number(producto.precio).toFixed(2)}</p>
          <p className="modal-producto__descripcion">
            {producto.descripcion || 'Preparado con ingredientes seleccionados de temporada.'}
          </p>

          {producto.disponible_hoy != null && (
            <p className={`modal-producto__cupo ${sinCupo ? 'modal-producto__cupo--agotado' : ''}`}>
              {sinCupo ? 'Sin cupo disponible por hoy' : `Quedan ${producto.disponible_hoy} cupos para reservar hoy`}
            </p>
          )}

          {usuario?.rol === 'cliente' ? (
            <div className="modal-producto__accion">
              <div className="selector-cantidad">
                <button type="button" onClick={() => setCantidad((c) => Math.max(1, c - 1))} disabled={sinCupo} aria-label="Quitar uno">
                  <IconoMenos />
                </button>
                <span>{cantidad}</span>
                <button type="button" onClick={() => setCantidad((c) => Math.min(maximo, c + 1))} disabled={sinCupo || cantidad >= maximo} aria-label="Agregar uno">
                  <IconoMas />
                </button>
              </div>
              <button className="boton boton-primario" onClick={agregarAlCarrito} disabled={sinCupo}>
                <IconoCarrito width="16" height="16" /> {agregado ? 'Agregado' : 'Agregar a mi reserva'}
              </button>
            </div>
          ) : (
            <p className="ayuda-campo">Inicia sesión como cliente para agregar este plato a tu reserva.</p>
          )}
        </div>
      </div>
    </div>
  );
}
