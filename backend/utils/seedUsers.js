/**
 * Asigna correo + contraseña (hasheada con bcrypt) a los empleados/clientes
 * de prueba del schema.sql, para poder iniciar sesión.
 * Ejecutar una sola vez, después de correr schema.sql:
 *    npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Empleados que ya tenían correo_electronico en el dump (6 a 13) se dejan tal
// cual (ya vienen con contraseña en texto plano en los datos de ejemplo del
// equipo — aquí se re-hashean para que login.js pueda usarlas con bcrypt).
const EMPLEADOS_PRUEBA = [
  { id_empleado: 1, correo: 'admin@elfogon.com', password: 'Admin#2026' },   // administrador (id 1)
  { id_empleado: 2, correo: 'cocina@elfogon.com', password: 'Cocina#2026' }, // cocinero (id 1)
  { id_empleado: 3, correo: 'salon@elfogon.com', password: 'Salon#2026' },
  { id_empleado: 4, correo: 'almacen@elfogon.com', password: 'Almacen#2026' },
  { id_empleado: 5, correo: 'caja@elfogon.com', password: 'Caja#2026' }
];

const CLIENTES_PRUEBA = [
  { id_cliente: 1, password: 'Cliente#2026' } // ya tiene correo: paola.gutierrez@example.com
];

async function ejecutar() {
  for (const e of EMPLEADOS_PRUEBA) {
    const hash = await bcrypt.hash(e.password, 12);
    await pool.query(
      "UPDATE empleado SET correo_electronico = ?, contrasenia = ?, estado = COALESCE(estado, 'Activo') WHERE id_empleado = ?",
      [e.correo, hash, e.id_empleado]
    );
    console.log(`Empleado actualizado: ${e.correo} (id_empleado ${e.id_empleado})`);
  }

  for (const c of CLIENTES_PRUEBA) {
    const hash = await bcrypt.hash(c.password, 12);
    await pool.query('UPDATE cliente SET contrasenia = ? WHERE id_cliente = ?', [hash, c.id_cliente]);
    console.log(`Cliente actualizado: id_cliente ${c.id_cliente}`);
  }

  // Los empleados 6-13 del dump ya traen correo_electronico + contrasenia en
  // texto plano (p. ej. 'Carlos@2026'); se re-hashean para que funcionen con bcrypt.
  const [empleadosConClave] = await pool.query(
    "SELECT id_empleado, contrasenia FROM empleado WHERE id_empleado >= 6 AND contrasenia IS NOT NULL"
  );
  for (const emp of empleadosConClave) {
    if (emp.contrasenia.startsWith('$2')) continue; // ya está hasheada
    const hash = await bcrypt.hash(emp.contrasenia, 12);
    await pool.query('UPDATE empleado SET contrasenia = ? WHERE id_empleado = ?', [hash, emp.id_empleado]);
    console.log(`Contraseña re-hasheada para id_empleado ${emp.id_empleado}`);
  }

  console.log('\n=== Credenciales de prueba ===');
  console.log('admin    -> admin@elfogon.com    / Admin#2026');
  console.log('cocina   -> cocina@elfogon.com   / Cocina#2026');
  console.log('salon    -> salon@elfogon.com    / Salon#2026');
  console.log('almacen  -> almacen@elfogon.com  / Almacen#2026');
  console.log('caja     -> caja@elfogon.com     / Caja#2026');
  console.log('cliente  -> paola.gutierrez@example.com / Cliente#2026');
  console.log('==============================\n');
  process.exit(0);
}

ejecutar().catch((err) => {
  console.error(err);
  process.exit(1);
});
