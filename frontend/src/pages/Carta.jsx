import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import Cargando from '../components/Cargando.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';
import ProductoModal from '../components/ProductoModal.jsx';
import { IconoBuscar } from '../components/Icons.jsx';

const CATEGORIAS = ['Todas', 'Entrada', 'Plato Fuerte', 'Postre', 'Bebida', 'Adicional'];

export default function Carta() {
  const [productos, setProductos] = useState([]);
  const [categoria, setCategoria] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    setCargando(true);
    const params = categoria !== 'Todas' ? { categoria } : {};
    api.get('/productos', { params })
      .then((res) => setProductos(res.data))
      .finally(() => setCargando(false));
  }, [categoria]);

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return productos;
    return productos.filter((p) => p.nombre.toLowerCase().includes(termino));
  }, [productos, busqueda]);

  // Heurística visual (no persistida): marca "recomendado" el primero de cada
  // categoría para que la carta no se vea sin distintivos mientras el backend
  // no exponga un campo dedicado de destacados.
  function obtenerBadge(producto, indice) {
    if (producto.disponible_hoy === 0) return { tipo: 'agotado', texto: 'Sin cupo hoy' };
    if (indice === 0) return { tipo: 'recomendado', texto: 'Recomendado' };
    return null;
  }

  return (
    <div className="contenedor" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <span className="eyebrow">Carta de temporada</span>
      <h1>Nuestra Carta</h1>
      <p className="subtitulo-seccion">
        Cada plato se prepara al momento con ingredientes de temporada seleccionados por nuestra
        cocina. Filtra por categoría, busca un plato, o haz clic en cualquier tarjeta para ver el
        detalle completo y agregarlo a tu próxima reserva.
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, margin: '22px 0 8px' }}>
        <div className="captcha-fila" style={{ flexWrap: 'wrap' }}>
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              className={c === categoria ? 'boton boton-primario' : 'boton boton-outline'}
              onClick={() => setCategoria(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="buscador">
          <span className="icono-lupa"><IconoBuscar /></span>
          <input
            type="text"
            placeholder="Buscar un plato…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        {cargando && <Cargando texto="Cargando la carta…" />}

        {!cargando && productosFiltrados.length > 0 && (
          <div className="rejilla">
            {productosFiltrados.map((p, i) => {
              const badge = obtenerBadge(p, i);
              return (
                <article
                  className="tarjeta-producto tarjeta-producto--clicable"
                  key={p.id_producto}
                  onClick={() => setSeleccionado(p)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') setSeleccionado(p); }}
                >
                  <div className={`tarjeta-producto__media ${p.imagen_url ? '' : 'tarjeta-producto__media--textura'}`}>
                    {p.imagen_url && <img src={p.imagen_url} alt={p.nombre} loading="lazy" />}
                    {badge && (
                      <div className="badges-fila">
                        <span className={`badge badge-${badge.tipo}`}>{badge.texto}</span>
                      </div>
                    )}
                  </div>
                  <div className="tarjeta-producto__cuerpo">
                    <span className="categoria-chip">{p.categoria}</span>
                    <h3>
                      <span>{p.nombre}</span>
                      <span className="precio">Bs {Number(p.precio).toFixed(2)}</span>
                    </h3>
                    <p>{p.descripcion || 'Preparado con ingredientes seleccionados de temporada.'}</p>
                    {p.disponible_hoy != null && p.disponible_hoy > 0 && (
                      <p className="tarjeta-producto__cupo">Quedan {p.disponible_hoy} cupos hoy</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!cargando && productosFiltrados.length === 0 && busqueda && (
          <EstadoVacio
            titulo="Sin resultados"
            texto={`No encontramos platos que coincidan con "${busqueda}". Prueba con otro término o cambia de categoría.`}
          />
        )}

        {!cargando && productosFiltrados.length === 0 && !busqueda && (
          <EstadoVacio
            titulo="Categoría sin platos por ahora"
            texto="Estamos actualizando esta sección de la carta. Vuelve a intentarlo en otra categoría."
          />
        )}
      </div>

      {seleccionado && (
        <ProductoModal producto={seleccionado} onClose={() => setSeleccionado(null)} />
      )}
    </div>
  );
}
