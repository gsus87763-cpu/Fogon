/**
 * Evalúa la fortaleza de una contraseña y devuelve:
 *   { nivel: 'debil' | 'intermedia' | 'fuerte', puntaje: number, detalles: {...} }
 * Se usa tanto para feedback en tiempo real (frontend, vía este mismo criterio)
 * como para bloquear el registro en el backend si la contraseña es débil.
 */
function evaluarFortaleza(password = '') {
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

module.exports = { evaluarFortaleza };
