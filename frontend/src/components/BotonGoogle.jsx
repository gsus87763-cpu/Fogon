import { useEffect, useRef } from 'react';
import api from '../services/api';

// Carga el script de Google Identity Services una sola vez (aunque se
// monten varios BotonGoogle en la misma página).
let promesaScriptGoogle = null;
function cargarScriptGoogle() {
  if (promesaScriptGoogle) return promesaScriptGoogle;
  promesaScriptGoogle = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return promesaScriptGoogle;
}

/**
 * Botón "Continuar con Google". Al autenticarse, envía el idToken al
 * backend (POST /auth/google) y llama a onExito({ token, usuario }).
 * Si no hay VITE_GOOGLE_CLIENT_ID configurado, no se muestra nada (para
 * no romper el login local mientras no se configure OAuth).
 */
export default function BotonGoogle({ onExito, onError }) {
  const contenedorRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    let cancelado = false;

    cargarScriptGoogle().then(() => {
      if (cancelado || !window.google?.accounts?.id || !contenedorRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          try {
            const res = await api.post('/auth/google', { idToken: credential });
            onExito(res.data);
          } catch (err) {
            onError?.(err.response?.data?.mensaje || 'No se pudo iniciar sesión con Google');
          }
        }
      });

      window.google.accounts.id.renderButton(contenedorRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
        locale: 'es'
      });
    }).catch(() => onError?.('No se pudo cargar el botón de Google'));

    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  if (!clientId) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, margin: '16px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', color: 'var(--texto-secundario)', fontSize: '.85rem' }}>
        <span style={{ flex: 1, height: 1, background: 'var(--borde-suave)' }} />
        o
        <span style={{ flex: 1, height: 1, background: 'var(--borde-suave)' }} />
      </div>
      <div ref={contenedorRef} />
    </div>
  );
}
