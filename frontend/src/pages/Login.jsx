import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { IconoAdvertencia, IconoRefrescar } from '../components/Icons.jsx';

function validarCorreo(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState(null);
  const [captchaRespuesta, setCaptchaRespuesta] = useState('');
  const [tocado, setTocado] = useState({});
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  async function cargarCaptcha() {
    const res = await api.get('/auth/captcha');
    setCaptcha(res.data);
    setCaptchaRespuesta('');
  }

  useEffect(() => { cargarCaptcha(); }, []);

  function errorDe(campo) {
    if (!tocado[campo]) return null;
    if (campo === 'correo') {
      if (!correo) return 'El correo es obligatorio';
      if (!validarCorreo(correo)) return 'Ingresa un correo con formato válido (nombre@dominio.com)';
    }
    if (campo === 'password' && !password) return 'La contraseña es obligatoria';
    if (campo === 'captcha' && !captchaRespuesta) return 'Escribe el texto de la imagen para verificar que eres humano';
    return null;
  }

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setTocado({ correo: true, password: true, captcha: true });

    if (!validarCorreo(correo) || !password || !captchaRespuesta) return;

    setEnviando(true);
    try {
      const res = await api.post('/auth/login', {
        correo, password,
        captchaId: captcha.captchaId,
        captchaRespuesta
      });
      iniciarSesion(res.data);
      navigate('/panel');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo iniciar sesión. Verifica tus datos e inténtalo de nuevo.');
      cargarCaptcha();
      setTocado((t) => ({ ...t, captcha: false }));
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
          </div>

          <div className="campo">
            <label>Verificación de seguridad</label>
            {captcha && (
              <div className="captcha-fila" style={{ background: 'var(--crema)', padding: 10, borderRadius: 8 }}>
                <span dangerouslySetInnerHTML={{ __html: captcha.svg }} />
                <button type="button" className="boton boton-outline" onClick={cargarCaptcha} title="Generar otro captcha" aria-label="Generar otro captcha">
                  <IconoRefrescar />
                </button>
              </div>
            )}
            <input
              style={{ marginTop: 8 }}
              className={errorDe('captcha') ? 'campo-invalido' : ''}
              value={captchaRespuesta}
              onChange={(e) => setCaptchaRespuesta(e.target.value)}
              onBlur={() => setTocado((t) => ({ ...t, captcha: true }))}
              placeholder="Escribe el texto de la imagen"
            />
            {errorDe('captcha') && <span className="error-campo"><IconoAdvertencia /> {errorDe('captcha')}</span>}
          </div>

          <button className="boton boton-primario boton-ancho" disabled={enviando}>
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </button>

          <p style={{ fontSize: '.9rem', textAlign: 'center' }}>
            ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
