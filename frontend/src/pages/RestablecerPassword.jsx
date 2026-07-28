import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { IconoAdvertencia, IconoCheck } from '../components/Icons.jsx';

export default function RestablecerPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  async function enviar(e) {
    e.preventDefault();
    setError(''); setMensaje('');

    if (!token) { setError('El enlace no es válido. Solicita uno nuevo.'); return; }
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    if (password !== confirmar) { setError('Las contraseñas no coinciden'); return; }

    setEnviando(true);
    try {
      const res = await api.post('/auth/restablecer', { token, password });
      setMensaje(res.data.mensaje);
      setTimeout(() => navigate('/login'), 1600);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo restablecer la contraseña');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="contenedor" style={{ paddingTop: 40, paddingBottom: 60, display: 'flex', justifyContent: 'center' }}>
      <div className="tarjeta" style={{ width: '100%', maxWidth: 440 }}>
        <span className="eyebrow">Un último paso</span>
        <h1 style={{ fontSize: '1.5rem' }}>Crear nueva contraseña</h1>

        {!token && (
          <div className="mensaje-alerta mensaje-error"><IconoAdvertencia />
            Este enlace no incluye un token válido. Pídelo de nuevo desde <Link to="/recuperar-password">Recuperar contraseña</Link>.
          </div>
        )}

        <form className="formulario" style={{ maxWidth: 'none', marginTop: 16 }} onSubmit={enviar} noValidate>
          {error && <div className="mensaje-alerta mensaje-error"><IconoAdvertencia />{error}</div>}
          {mensaje && <div className="mensaje-alerta mensaje-exito"><IconoCheck />{mensaje}</div>}

          <div className="campo">
            <label>Nueva contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </div>
          <div className="campo">
            <label>Confirmar contraseña</label>
            <input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} required minLength={8} />
          </div>

          <button className="boton boton-primario boton-ancho" disabled={enviando || !token}>
            {enviando ? 'Guardando…' : 'Restablecer contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
