import { useEffect, useRef } from 'react';
import api from '../services/api';

// Usa Google Identity Services (cargado en index.html). Cuando el usuario
// elige su cuenta de Google, Google entrega un idToken que se manda al
// backend (/api/auth/google), que lo verifica y devuelve nuestro propio JWT.
export default function BotonGoogle({ onExito, onError }) {
  const contenedorRef = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google || !contenedorRef.current) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (respuesta) => {
        try {
          const res = await api.post('/auth/google', { idToken: respuesta.credential });
          onExito(res.data);
        } catch (err) {
          onError?.(err.response?.data?.mensaje || 'No se pudo iniciar sesión con Google');
        }
      }
    });

    window.google.accounts.id.renderButton(contenedorRef.current, {
      theme: 'outline', size: 'large', width: 320, text: 'continue_with', locale: 'es'
    });
  }, [onExito, onError]);

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, margin: '14px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
        <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--borde, #ddd)' }} />
        <span style={{ fontSize: '.8rem', color: '#888' }}>o</span>
        <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--borde, #ddd)' }} />
      </div>
      <div ref={contenedorRef} />
    </div>
  );
}
