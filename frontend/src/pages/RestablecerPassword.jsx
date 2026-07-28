import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { IconoAdvertencia, IconoCheck } from '../components/Icons.jsx';

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
  return { nivel };
}

const NIVEL_TEXTO = { debil: 'Débil', intermedia: 'Intermedia', fuerte: 'Fuerte' };

export default function RestablecerPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  const fortaleza = evaluarFortalezaLocal(password);
  const coinciden = password && password === confirmar;

  async function enviar(e) {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('El enlace no es válido. Solicita uno nuevo desde "Olvidaste tu contraseña".');
      return;
    }
    if (fortaleza.nivel === 'debil') {
      setError('Elige una contraseña más segura (mínimo intermedia).');
      return;
    }
    if (!coinciden) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setEnviando(true);
    try {
      const res = await api.post('/auth/restablecer', { token, password });
      setExito(res.data?.mensaje || 'Contraseña actualizada correctamente');
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
        <span className="eyebrow">Último paso</span>
        <h1 style={{ fontSize: '1.5rem' }}>Crea una contraseña nueva</h1>

        {!token && (
          <div className="mensaje-alerta mensaje-error" style={{ marginTop: 12 }}>
            <IconoAdvertencia /> Este enlace no trae un token válido. Pídelo de nuevo desde
            "¿Olvidaste tu contraseña?".
          </div>
        )}

        <form className="formulario" style={{ maxWidth: 'none', marginTop: 16 }} onSubmit={enviar} noValidate>
          {error && <div className="mensaje-alerta mensaje-error"><IconoAdvertencia />{error}</div>}
          {exito && <div className="mensaje-alerta mensaje-exito"><IconoCheck />{exito}</div>}

          <div className="campo">
            <label>Nueva contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={Boolean(exito)} />
            {password && (
              <span className="error-campo" style={{ color: 'var(--texto-secundario)' }}>
                Fortaleza: {NIVEL_TEXTO[fortaleza.nivel]}
              </span>
            )}
          </div>

          <div className="campo">
            <label>Confirmar contraseña</label>
            <input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} disabled={Boolean(exito)} />
          </div>

          <button className="boton boton-primario boton-ancho" disabled={enviando || !token || Boolean(exito)}>
            {enviando ? 'Guardando…' : 'Guardar nueva contraseña'}
          </button>

          <p style={{ fontSize: '.9rem', textAlign: 'center' }}>
            <Link to="/login">Volver a iniciar sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
