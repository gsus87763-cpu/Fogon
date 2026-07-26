// Fotografías reales bajo Unsplash License (uso libre, comercial y sin atribución
// obligatoria — https://unsplash.com/license). Se mapean por nombre exacto del
// producto sembrado en la base de datos. Si un producto nuevo no tiene coincidencia,
// el componente que lo consuma debe usar el respaldo visual (franja de textura CSS)
// en vez de romper o mostrar una imagen incorrecta.

const PARAMS = 'auto=format&fit=crop&q=80';

export const IMAGENES_PLATOS = {
  'Sopa de Maní': `https://images.unsplash.com/photo-1665594051407-7385d281ad76?${PARAMS}&w=800`,
  'Picante de Pollo': `https://images.unsplash.com/photo-1708782344490-9026aaa5eec7?${PARAMS}&w=800`,
  'Parrillada El Fogón': `https://images.unsplash.com/photo-1774668748614-f188f5b61535?${PARAMS}&w=800`,
  'Tiramisú de la Casa': `https://images.unsplash.com/photo-1746888151121-1002113ed286?${PARAMS}&w=800`,
  'Limonada de Coco': `https://images.unsplash.com/photo-1754594537133-796eb54f206c?${PARAMS}&w=800`
};

export function obtenerImagenPlato(nombre) {
  return IMAGENES_PLATOS[nombre] || null;
}

// Foto del equipo de desarrollo (banner ilustrativo de colaboración, no un
// retrato literal de las 4 personas listadas en los créditos).
export const IMAGEN_EQUIPO_DESARROLLO =
  `https://images.unsplash.com/photo-1758691737124-05c5bffe46f0?${PARAMS}&w=1200`;
