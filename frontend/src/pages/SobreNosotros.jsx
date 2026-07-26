import { IconoHoja, IconoManos, IconoTrigo, IconoPersona } from '../components/Icons.jsx';
import { IMAGEN_EQUIPO_DESARROLLO } from '../utils/imagenEquipo.js';

const VALORES = [
  { Icono: IconoTrigo, titulo: 'Ingredientes locales', texto: 'Compramos a proveedores de la región para garantizar frescura y apoyar a productores locales.' },
  { Icono: IconoManos, titulo: 'Hospitalidad genuina', texto: 'Cada mesa recibe la misma atención, sin importar si es la primera visita o la número cien.' },
  { Icono: IconoHoja, titulo: 'Sostenibilidad', texto: 'Reducimos desperdicio de insumos con control de stock y compras planificadas desde almacén.' }
];

const EQUIPO_DESARROLLO = [
  'Nicole Belén Terán Quiroga',
  'Edwin Dylan Salazar Cruz',
  'Josué Alejandro Terrazas Ramos',
  'Marcelo Jesús Villalobos Cerrillo'
];

export default function SobreNosotros() {
  return (
    <div>
      <div className="contenedor" style={{ paddingTop: 40 }}>
        <span className="eyebrow">Nuestra historia</span>
        <h1>Sobre El Fogón</h1>
        <p className="subtitulo-seccion">
          El Fogón nació de la idea de recuperar el sabor de la cocina boliviana de casa y
          servirlo con el cuidado de un restaurante de mantel. Empezamos como un proyecto
          familiar alrededor de una parrilla y hoy somos un equipo completo: cocina, salón,
          almacén y administración trabajando para que cada visita se sienta cuidada de
          principio a fin.
        </p>
        <p className="subtitulo-seccion">
          Nuestra cocina trabaja con proveedores locales y un equipo certificado, cuidando
          cada detalle desde el almacén hasta la mesa — porque un buen plato empieza mucho
          antes de llegar a la parrilla.
        </p>
      </div>

      <section className="seccion contenedor">
        <span className="eyebrow">Filosofía</span>
        <h2>Lo que nos guía</h2>
        <div className="rejilla" style={{ marginTop: 24 }}>
          {VALORES.map((v) => (
            <div className="tarjeta" key={v.titulo}>
              <v.Icono width="24" height="24" style={{ color: 'var(--dorado)', marginBottom: 10 }} />
              <h3 style={{ fontSize: '1.05rem' }}>{v.titulo}</h3>
              <p style={{ color: 'var(--texto-secundario)', fontSize: '.9rem', margin: 0 }}>{v.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="seccion seccion-oscura">
        <div className="contenedor">
          <span className="eyebrow">Nuestro equipo</span>
          <h2>Cocina y servicio</h2>
          <p className="subtitulo-seccion">
            Detrás de cada plato hay una chef ejecutiva certificada, un equipo de cocineros
            especializados en parrilla y cocina de autor, y un equipo de salón dedicado a que
            tu visita sea cómoda de principio a fin.
          </p>
          <div className="rejilla-4" style={{ marginTop: 24 }}>
            {['Chef Ejecutiva', 'Equipo de cocina', 'Encargado de salón', 'Equipo de almacén'].map((rol) => (
              <div className="testimonio" key={rol} style={{ textAlign: 'center' }}>
                <IconoPersona width="24" height="24" style={{ color: 'var(--dorado-claro)' }} />
                <p className="autor" style={{ marginTop: 8 }}>{rol}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Créditos del equipo de desarrollo, con imagen --- */}
      <div className="contenedor" style={{ paddingBottom: 60 }}>
        <div className="creditos-equipo creditos-equipo--con-imagen">
          <div className="creditos-equipo__imagen">
            <img src={IMAGEN_EQUIPO_DESARROLLO} alt="Equipo de desarrollo trabajando en la plataforma" loading="lazy" />
          </div>
          <div className="creditos-equipo__contenido">
            <span className="eyebrow">Equipo de desarrollo</span>
            <h3 style={{ marginTop: 0 }}>Quiénes construyeron esta plataforma</h3>
            <p style={{ color: 'var(--texto-secundario)', fontSize: '.9rem', margin: 0 }}>
              Este sistema web de gestión fue diseñado y desarrollado por:
            </p>
            <ul className="lista-creditos">
              {EQUIPO_DESARROLLO.map((nombre) => <li key={nombre}>{nombre}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
