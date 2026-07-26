// Iconos SVG con trazo, en línea con el resto del sistema de diseño (sin emojis).
// currentColor hereda el color del texto para integrarse en cualquier contexto.

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, 'aria-hidden': true };

export function IconoMenu(props) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}
export function IconoCerrar(props) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...base} {...props}>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
export function IconoBuscar(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}
export function IconoAdvertencia(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 4 2 20h20L12 4Z" strokeLinejoin="round" />
      <path d="M12 10v4" strokeLinecap="round" />
      <circle cx="12" cy="17" r=".5" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function IconoCheck(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...base} {...props}>
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function IconoCirculo(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}
export function IconoRefrescar(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...base} {...props}>
      <path d="M4 4v6h6M20 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 14a7 7 0 0 0 12.3 3.5M19 10A7 7 0 0 0 6.7 6.5" strokeLinecap="round" />
    </svg>
  );
}
export function IconoCalendario(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base} {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" strokeLinecap="round" />
    </svg>
  );
}
export function IconoPlato(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}
export function IconoPersona(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6" strokeLinecap="round" />
    </svg>
  );
}
export function IconoManos(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base} {...props}>
      <path d="M3 12l3-2 3 1.5L13 8l3 1 5 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 11.5 9 16l3 2 4-2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function IconoHoja(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base} {...props}>
      <path d="M5 19C5 10 11 4 20 4c0 9-6 15-15 15Z" strokeLinejoin="round" />
      <path d="M5 19c3-5 6-8 11-11" strokeLinecap="round" />
    </svg>
  );
}
export function IconoTrigo(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 3v18" strokeLinecap="round" />
      <path d="M12 6 8 8M12 6l4 2M12 10 8 12M12 10l4 2M12 14 8 16M12 14l4 2" strokeLinecap="round" />
    </svg>
  );
}
export function IconoFuego(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 3c1 3-2 4-2 7a4 4 0 0 0 8 0c0-2-1-3-1-3 2 1 3 4 3 6a6 6 0 0 1-12 0c0-4 2-6 4-10Z" strokeLinejoin="round" />
    </svg>
  );
}
export function IconoSilla(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base} {...props}>
      <path d="M6 4v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4M6 20v-3M18 20v-3M6 13H4M20 13h-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function IconoUbicacion(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}
export function IconoTelefono(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...base} {...props}>
      <path d="M4.5 4h4l1.5 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 1.5v4a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3 5.6 1.5 1.5 0 0 1 4.5 4Z" />
    </svg>
  );
}
export function IconoReloj(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}
export function IconoSol(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v3M12 18.5v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2.5 12h3M18.5 12h3M4.9 19.1 7 17M17 7l2.1-2.1" strokeLinecap="round" />
    </svg>
  );
}
export function IconoLuna(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...base} {...props}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" strokeLinejoin="round" />
    </svg>
  );
}
export function IconoCarrito(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="10" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <path d="M2.5 3h2l2.2 12.1a2 2 0 0 0 2 1.65h8.6a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function IconoMas(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...base} strokeWidth="2.2" {...props}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}
export function IconoMenos(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...base} strokeWidth="2.2" {...props}>
      <path d="M5 12h14" strokeLinecap="round" />
    </svg>
  );
}
export function IconoBasura(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...base} {...props}>
      <path d="M4 7h16M9 7V4.5h6V7M6 7l1 13.5A1.5 1.5 0 0 0 8.5 22h7a1.5 1.5 0 0 0 1.5-1.5L18 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function IconoInstagram(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...base} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r=".8" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function IconoFacebook(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...base} {...props}>
      <path d="M15 4h-2.2C10.7 4 9.5 5.3 9.5 7.3V10H7v3.2h2.5V21h3.3v-7.8H15l.6-3.2h-2.8V7.6c0-.9.5-1.4 1.4-1.4H15Z" strokeLinejoin="round" />
    </svg>
  );
}
export function IconoWhatsapp(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...base} {...props}>
      <path d="M6.5 17.5 4.5 20l2.6-.7A8 8 0 1 0 6.5 17.5Z" strokeLinejoin="round" />
      <path d="M9 9.3c0 3.8 2.9 6.7 6.7 6.7.6 0 1-.5.9-1.1l-.2-1a.8.8 0 0 0-.8-.6l-1.4.2a5 5 0 0 1-2.7-2.7l.2-1.4a.8.8 0 0 0-.6-.8l-1-.2c-.6-.1-1.1.3-1.1.9Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function IconoCorreo(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 6.5 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function IconoEstrella(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true" {...props}>
      <path d="M12 2.5l2.9 6.3 6.8.7-5.1 4.6 1.5 6.8L12 17.6 5.9 20.9l1.5-6.8-5.1-4.6 6.8-.7L12 2.5Z" />
    </svg>
  );
}
export function IconoFlechaArriba(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...base} strokeWidth="2.2" {...props}>
      <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
