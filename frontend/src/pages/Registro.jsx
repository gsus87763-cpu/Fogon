import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { IconoAdvertencia, IconoCheck, IconoCirculo } from '../components/Icons.jsx';
import BotonGoogle from '../components/BotonGoogle.jsx';

function evaluarFortalezaLocal(password) {
  const detalles = {
    longitudMinima: password.length >= 8,
    tieneMayuscula: /[A-Z]/.test(password),
    tieneMinuscula: /[a-z]/.test(password),
    tieneNumero: /[0-9]/.test(password),
    tieneEspecial: /[^A-Za-z0-9]/.test(password)
  };
  let puntaje = Object.values(detalles).filter(Boolean).length;
  if (password.length >= 12) puntaje += 1;
  let nivel = 'debil';
  if (puntaje >= 5) nivel = 'fuerte';
  else if (puntaje >= 3) nivel = 'intermedia';
  return { nivel, puntaje, detalles };
}

const REQUISITOS = [
  { clave: 'longitudMinima', texto: 'Al menos 8 caracteres' },
  { clave: 'tieneMayuscula', texto: 'Una letra mayúscula' },
  { clave: 'tieneMinuscula', texto: 'Una letra minúscula' },
  { clave: 'tieneNumero', texto: 'Un número' },
  { clave: 'tieneEspecial', texto: 'Un carácter especial (!@#$…)' }
];

const NIVEL_TEXTO = { debil: 'Débil', intermedia: 'Intermedia', fuerte: 'Fuerte' };

function validarCorreo(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

export default function Registro() {
  const [form, setForm] = useState({ nombre: '', apellidos: '', correo: '', telefono: '', password: '', confirmarPassword: '' });
  const [tocado, setTocado] = useState({});
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [captcha, setCaptcha] = useState(null);
  const [captchaTexto, setCaptchaTexto] = useState('');
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  function cargarCaptcha() {
    setCaptchaTexto('');
    api.get('/auth/captcha').then((res) => setCaptcha(res.data)).catch(() => setCaptcha(null));
  }
  useEffect(cargarCaptcha, []);

  const fortaleza = evaluarFortalezaLocal(form.password);
  const contraseñasCoinciden = form.password && form.password === form.confirmarPassword;

  function actualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }
  function marcarTocado(campo) {
    setTocado((t) => ({ ...t, [campo]: true }));
  }

  function errorDe(campo) {
    if (!tocado[campo]) return null;
    if (campo === 'nombre' && form.nombre.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (campo === 'apellidos' && form.apellidos.trim().length < 2) return 'Los apellidos deben tener al menos 2 caracteres';
    if (campo === 'correo' && !validarCorreo(form.correo)) return 'Ingresa un correo con formato válido';
    if (campo === 'password' && fortaleza.nivel === 'debil') return 'Elige una contraseña más segura (mínimo intermedia)';
    if (campo === 'confirmarPassword' && !contraseñasCoinciden) return 'Las contraseñas no coinciden';
    return null;
  }

  async function enviar(e) {
    e.preventDefault();
    setError(''); setExito('');
    setTocado({ nombre: true, apellidos: true, correo: true, password: true, confirmarPassword: true });

    if (form.nombre.trim().length < 2 || form.apellidos.trim().length < 2 || !validarCorreo(form.correo)) {
      setError('Revisa los campos marcados en rojo antes de continuar.');
      return;
    }
    if (fortaleza.nivel === 'debil') {
      setError('Elige una contraseña más segura antes de continuar (mínimo intermedia).');
      return;
    }
    if (!contraseñasCoinciden) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!captchaTexto) {
      setError('Ingresa el texto del captcha');
      return;
    }

    setEnviando(true);
    try {
      const res = await api.post('/auth/registro', {
        nombre: form.nombre, apellidos: form.apellidos, correo: form.correo,
        telefono: form.telefono, password: form.password,
        captchaId: captcha?.captchaId, captchaTexto
      });
      iniciarSesion(res.data);
      setExito('Cuenta creada correctamente. Te llevamos a tu panel…');
      setTimeout(() => navigate('/panel'), 1200);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo completar el registro');
      cargarCaptcha();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="contenedor" style={{ paddingTop: 40, paddingBottom: 60, display: 'flex', justifyContent: 'center' }}>
      <div className="tarjeta" style={{ width: '100%', maxWidth: 480 }}>
        <span className="eyebrow">Únete a El Fogón</span>
        <h1 style={{ fontSize: '1.6rem' }}>Crear cuenta</h1>

        <form className="formulario" style={{ maxWidth: 'none', marginTop: 16 }} onSubmit={enviar} noValidate>
          {error && <div className="mensaje-alerta mensaje-error"><IconoAdvertencia />{error}</div>}
          {exito && <div className="mensaje-alerta mensaje-exito"><IconoCheck />{exito}</div>}

          <div className="campo">
            <label>Nombre</label>
            <input
              className={errorDe('nombre') ? 'campo-invalido' : ''}
              value={form.nombre}
              onChange={(e) => actualizar('nombre', e.target.value)}
              onBlur={() => marcarTocado('nombre')}
            />
            {errorDe('nombre') && <span className="error-campo"><IconoAdvertencia /> {errorDe('nombre')}</span>}
          </div>

          <div className="campo">
            <label>Apellidos</label>
            <input
              className={errorDe('apellidos') ? 'campo-invalido' : ''}
              value={form.apellidos}
              onChange={(e) => actualizar('apellidos', e.target.value)}
              onBlur={() => marcarTocado('apellidos')}
            />
            {errorDe('apellidos') && <span className="error-campo"><IconoAdvertencia /> {errorDe('apellidos')}</span>}
          </div>

          <div className="campo">
            <label>Correo electrónico</label>
            <input
              type="email"
              className={errorDe('correo') ? 'campo-invalido' : ''}
              value={form.correo}
              onChange={(e) => actualizar('correo', e.target.value)}
              onBlur={() => marcarTocado('correo')}
            />
            {errorDe('correo') && <span className="error-campo"><IconoAdvertencia /> {errorDe('correo')}</span>}
          </div>

          <div className="campo">
            <label>Teléfono (opcional)</label>
            <input value={form.telefono} onChange={(e) => actualizar('telefono', e.target.value)} />
          </div>

          <div className="campo">
            <label>Contraseña</label>
            <input
              type="password"
              className={errorDe('password') ? 'campo-invalido' : ''}
              value={form.password}
              onChange={(e) => actualizar('password', e.target.value)}
              onBlur={() => marcarTocado('password')}
            />
            {form.password && (
              <>
                <div className="barra-fortaleza">
                  <div
                    className={`barra-fortaleza-relleno fortaleza-${fortaleza.nivel}`}
                    style={{ width: `${Math.min(100, (fortaleza.puntaje / 6) * 100)}%` }}
                  />
                </div>
                <span className={`fortaleza-etiqueta fortaleza-${fortaleza.nivel}`}>
                  Fortaleza: {NIVEL_TEXTO[fortaleza.nivel]}
                </span>
                <ul className="lista-requisitos">
                  {REQUISITOS.map((r) => (
                    <li key={r.clave} className={fortaleza.detalles[r.clave] ? 'cumplido' : ''}>
                      <span className="marca">
                        {fortaleza.detalles[r.clave] ? <IconoCheck width="12" height="12" /> : <IconoCirculo width="12" height="12" />}
                      </span>
                      {r.texto}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {errorDe('password') && <span className="error-campo"><IconoAdvertencia /> {errorDe('password')}</span>}
          </div>

          <div className="campo">
            <label>Confirmar contraseña</label>
            <input
              type="password"
              className={errorDe('confirmarPassword') ? 'campo-invalido' : (tocado.confirmarPassword && contraseñasCoinciden ? 'campo-valido' : '')}
              value={form.confirmarPassword}
              onChange={(e) => actualizar('confirmarPassword', e.target.value)}
              onBlur={() => marcarTocado('confirmarPassword')}
            />
            {errorDe('confirmarPassword') && <span className="error-campo"><IconoAdvertencia /> {errorDe('confirmarPassword')}</span>}
            {tocado.confirmarPassword && contraseñasCoinciden && (
              <span className="texto-exito-campo"><IconoCheck width="12" height="12" /> Las contraseñas coinciden</span>
            )}
          </div>

          <div className="campo">
            <label>Captcha</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {captcha && (
                <div
                  style={{ border: '1px solid var(--borde, #ccc)', borderRadius: 6, overflow: 'hidden' }}
                  dangerouslySetInnerHTML={{ __html: captcha.svg }}
                />
              )}
              <button type="button" className="boton boton-secundario" onClick={cargarCaptcha}>
                ⟳
              </button>
            </div>
            <input
              style={{ marginTop: 8 }}
              placeholder="Escribe el texto de la imagen"
              value={captchaTexto}
              onChange={(e) => setCaptchaTexto(e.target.value)}
            />
          </div>

          <button className="boton boton-primario boton-ancho" disabled={enviando}>
            {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>

          <BotonGoogle onExito={(datos) => { iniciarSesion(datos); navigate('/panel'); }} onError={setError} />

          <p style={{ fontSize: '.9rem', textAlign: 'center' }}>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
