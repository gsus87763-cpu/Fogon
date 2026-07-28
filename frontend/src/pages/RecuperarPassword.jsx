import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { IconoAdvertencia, IconoCheck } from '../components/Icons.jsx';

export default function RecuperarPassword() {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError(''); setMensaje('');
    setEnviando(true);
    try {
      const res = await api.post('/auth/recuperar', { correo });
      setMensaje(res.data.mensaje);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo procesar la solicitud');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="contenedor" style={{ paddingTop: 40, paddingBottom: 60, display: 'flex', justifyContent: 'center' }}>
      <div className="tarjeta" style={{ width: '100%', maxWidth: 440 }}>
        <span className="eyebrow">¿Olvidaste tu contraseña?</span>
        <h1 style={{ fontSize: '1.5rem' }}>Recuperar contraseña</h1>
        <p style={{ color: '#666', fontSize: '.95rem' }}>
          Escribe el correo con el que te registraste y te enviaremos un enlace para crear una nueva contraseña.
        </p>

        <form className="formulario" style={{ maxWidth: 'none', marginTop: 16 }} onSubmit={enviar} noValidate>
          {error && <div className="mensaje-alerta mensaje-error"><IconoAdvertencia />{error}</div>}
          {mensaje && <div className="mensaje-alerta mensaje-exito"><IconoCheck />{mensaje}</div>}

          <div className="campo">
            <label>Correo electrónico</label>
            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
          </div>

          <button className="boton boton-primario boton-ancho" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Enviar enlace de recuperación'}
          </button>

          <p style={{ fontSize: '.9rem', textAlign: 'center' }}>
            <Link to="/login">Volver a iniciar sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
