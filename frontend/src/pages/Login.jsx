import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { IconoAdvertencia } from '../components/Icons.jsx';
import BotonGoogle from '../components/BotonGoogle.jsx';

function validarCorreo(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [tocado, setTocado] = useState({});
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  function errorDe(campo) {
    if (!tocado[campo]) return null;
    if (campo === 'correo') {
      if (!correo) return 'El correo es obligatorio';
      if (!validarCorreo(correo)) return 'Ingresa un correo con formato válido (nombre@dominio.com)';
    }
    if (campo === 'password' && !password) return 'La contraseña es obligatoria';
    return null;
  }

  function entrarConSesion(datos) {
    iniciarSesion(datos);
    navigate('/panel');
  }

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setTocado({ correo: true, password: true });
    if (!validarCorreo(correo) || !password) return;

    setEnviando(true);
    try {
      const res = await api.post('/auth/login', { correo, password });
      entrarConSesion(res.data);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo iniciar sesión. Verifica tus datos e inténtalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="contenedor" style={{ paddingTop: 40, paddingBottom: 60, display: 'flex', justifyContent: 'center' }}>
      <div className="tarjeta" style={{ width: '100%', maxWidth: 440 }}>
        <span className="eyebrow">Bienvenido de vuelta</span>
        <h1 style={{ fontSize: '1.6rem' }}>Iniciar sesión</h1>

        <form className="formulario" style={{ maxWidth: 'none', marginTop: 16 }} onSubmit={enviar} noValidate>
          {error && <div className="mensaje-alerta mensaje-error"><IconoAdvertencia />{error}</div>}

          <div className="campo">
            <label>Correo electrónico</label>
            <input
              type="email"
              className={errorDe('correo') ? 'campo-invalido' : ''}
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              onBlur={() => setTocado((t) => ({ ...t, correo: true }))}
            />
            {errorDe('correo') && <span className="error-campo"><IconoAdvertencia /> {errorDe('correo')}</span>}
          </div>

          <div className="campo">
            <label>Contraseña</label>
            <input
              type="password"
              className={errorDe('password') ? 'campo-invalido' : ''}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTocado((t) => ({ ...t, password: true }))}
            />
            {errorDe('password') && <span className="error-campo"><IconoAdvertencia /> {errorDe('password')}</span>}
            <p style={{ fontSize: '.85rem', textAlign: 'right', marginTop: 6 }}>
              <Link to="/recuperar-password">¿Olvidaste tu contraseña?</Link>
            </p>
          </div>

          <button className="boton boton-primario boton-ancho" disabled={enviando}>
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </button>

          <BotonGoogle onExito={entrarConSesion} onError={setError} />

          <p style={{ fontSize: '.9rem', textAlign: 'center' }}>
            ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
