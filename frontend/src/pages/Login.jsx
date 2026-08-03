import { useEffect, useState } from 'react';
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
  const [captcha, setCaptcha] = useState(null);
  const [captchaRespuesta, setCaptchaRespuesta] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  async function cargarCaptcha() {
    try {
      const res = await api.get('/auth/captcha');
      setCaptcha(res.data);
      setCaptchaRespuesta('');
    } catch {
      setCaptcha(null);
    }
  }

  useEffect(() => { cargarCaptcha(); }, []);

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
    if (!captchaRespuesta.trim()) {
      setError('Completa el captcha antes de continuar.');
      return;
    }

    setEnviando(true);
    try {
      const res = await api.post('/auth/login', {
        correo, password, captchaId: captcha?.captchaId, captchaRespuesta
      });
      if (res.data.estadoSolicitud) {
        navigate('/solicitud-personal', { state: res.data });
        return;
      }
      entrarConSesion(res.data);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo iniciar sesión. Verifica tus datos e inténtalo de nuevo.');
      cargarCaptcha(); // el captcha es de un solo uso: pedimos uno nuevo tras un intento fallido
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

          <div className="campo">
            <label>Verificación</label>
            {captcha ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div
                  style={{ border: '1px solid var(--borde, #ddd)', borderRadius: 8, overflow: 'hidden', lineHeight: 0 }}
                  dangerouslySetInnerHTML={{ __html: captcha.svg }}
                />
                <button type="button" className="boton boton-secundario" onClick={cargarCaptcha}>
                  Recargar
                </button>
              </div>
            ) : (
              <span style={{ fontSize: '.85rem', color: '#888' }}>Cargando verificación…</span>
            )}
            <input
              style={{ marginTop: 8 }}
              value={captchaRespuesta}
              onChange={(e) => setCaptchaRespuesta(e.target.value)}
              placeholder="Escribe el texto de la imagen"
            />
          </div>

          <button className="boton boton-primario boton-ancho" disabled={enviando}>
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </button>

          <BotonGoogle onExito={entrarConSesion} onError={setError} />

          <p style={{ fontSize: '.9rem', textAlign: 'center' }}>
            ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
          </p>
          <p style={{ fontSize: '.85rem', textAlign: 'center', color: 'var(--texto-secundario)' }}>
            ¿Trabajas en El Fogón? <Link to="/registro-empleado">Regístrate como personal</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
