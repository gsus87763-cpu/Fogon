/**
 * Crea los usuarios de prueba (uno por rol) con contraseñas hasheadas con bcrypt.
 * Ejecutar una sola vez, después de correr schema.sql:
 *    npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const USUARIOS_PRUEBA = [
  { correo: 'admin@elfogon.com',   password: 'Admin#2026',   rol: 'admin',   id_empleado: 1 },
  { correo: 'salon@elfogon.com',   password: 'Salon#2026',   rol: 'salon',   id_empleado: 3 },
  { correo: 'cocina@elfogon.com',  password: 'Cocina#2026',  rol: 'cocina',  id_empleado: 2 },
  { correo: 'almacen@elfogon.com', password: 'Almacen#2026', rol: 'almacen', id_empleado: 4 },
  { correo: 'caja@elfogon.com',    password: 'Caja#2026',    rol: 'caja',    id_empleado: 5 },
  { correo: 'cliente@elfogon.com', password: 'Cliente#2026', rol: 'cliente', id_cliente: 1 }
];

async function ejecutar() {
  for (const u of USUARIOS_PRUEBA) {
    const [rolFilas] = await pool.query('SELECT id_rol FROM ROL WHERE nombre = ?', [u.rol]);
    if (rolFilas.length === 0) {
      console.warn(`Rol no encontrado: ${u.rol}, se omite ${u.correo}`);
      continue;
    }
    const hash = await bcrypt.hash(u.password, 12);
    await pool.query(
      `INSERT INTO USUARIO (correo, password_hash, id_rol, id_empleado, id_cliente)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      [u.correo, hash, rolFilas[0].id_rol, u.id_empleado || null, u.id_cliente || null]
    );
    console.log(`Usuario creado/actualizado: ${u.correo}`);
  }
  console.log('Listo. Ver README.md para la tabla de credenciales.');
  process.exit(0);
}

ejecutar().catch((err) => {
  console.error(err);
  process.exit(1);
});
