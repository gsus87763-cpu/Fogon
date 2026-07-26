import { createContext, useContext, useEffect, useState } from 'react';

const CarritoContext = createContext(null);

// Este "carrito" no procesa pagos ni pedidos: solo junta los platos que el
// cliente quiere anticipar para su reserva (por eso vive junto al flujo de
// Reservas). Se limpia automáticamente al confirmar una reserva.
export function CarritoProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const guardado = localStorage.getItem('carrito_reserva');
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('carrito_reserva', JSON.stringify(items));
  }, [items]);

  function agregar(producto, cantidad = 1) {
    setItems((actual) => {
      const existente = actual.find((i) => i.id_producto === producto.id_producto);
      const limite = producto.disponible_hoy != null ? producto.disponible_hoy : Infinity;
      if (existente) {
        const nuevaCantidad = Math.min(existente.cantidad + cantidad, limite || existente.cantidad);
        return actual.map((i) => i.id_producto === producto.id_producto ? { ...i, cantidad: nuevaCantidad } : i);
      }
      return [...actual, {
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen_url: producto.imagen_url,
        disponible_hoy: producto.disponible_hoy,
        cantidad: Math.min(cantidad, limite || cantidad)
      }];
    });
  }

  function quitar(id_producto) {
    setItems((actual) => actual.filter((i) => i.id_producto !== id_producto));
  }

  function actualizarCantidad(id_producto, cantidad) {
    setItems((actual) => actual.map((i) => {
      if (i.id_producto !== id_producto) return i;
      const limite = i.disponible_hoy != null ? i.disponible_hoy : Infinity;
      return { ...i, cantidad: Math.max(1, Math.min(cantidad, limite)) };
    }));
  }

  function vaciar() {
    setItems([]);
  }

  const total = items.reduce((suma, i) => suma + Number(i.precio) * i.cantidad, 0);
  const totalItems = items.reduce((suma, i) => suma + i.cantidad, 0);

  return (
    <CarritoContext.Provider value={{ items, agregar, quitar, actualizarCantidad, vaciar, total, totalItems }}>
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  return useContext(CarritoContext);
}
