export default function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="spinner-envoltorio">
      <div className="spinner" />
      <span>{texto}</span>
    </div>
  );
}
