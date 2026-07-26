import { IconoPlato } from './Icons.jsx';

export default function EstadoVacio({ icono: Icono = IconoPlato, titulo, texto }) {
  return (
    <div className="estado-vacio">
      <div className="icono"><Icono width="28" height="28" /></div>
      <h3>{titulo}</h3>
      <p>{texto}</p>
    </div>
  );
}
