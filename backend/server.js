require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const adminTablasRoutes = require('./routes/adminTablasRoutes');
const productoRoutes = require('./routes/productoRoutes');
const infraestructuraRoutes = require('./routes/infraestructuraRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
// PENDIENTES DE PORTAR al nuevo esquema (reserva ya no tiene hora/motivo/activo;
// estadisticas usaba RECURSO_MONETARIO que ya no existe):
// const reservaRoutes = require('./routes/reservaRoutes');
// const estadisticaRoutes = require('./routes/estadisticaRoutes');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  const pool = require('./config/db');
  const estado = { estado: 'ok', servicio: 'El Fogón API', bd: 'sin verificar' };
  try {
    const [tablas] = await pool.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME IN ('cliente','empleado','producto_emplatado','ambiente','mesa','reserva')`
    );
    const encontradas = tablas.map((t) => t.TABLE_NAME);
    const esperadas = ['cliente', 'empleado', 'producto_emplatado', 'ambiente', 'mesa', 'reserva'];
    const faltantes = esperadas.filter((t) => !encontradas.includes(t));
    estado.bd = faltantes.length === 0 ? 'ok' : `faltan tablas: ${faltantes.join(', ')} (corre schema.sql)`;
  } catch (err) {
    estado.bd = `sin conexión: ${err.code || err.message}`;
  }
  res.json(estado);
});

app.use('/api/auth', authRoutes);
app.use('/api/admin-tablas', adminTablasRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api', infraestructuraRoutes);

// Manejador de errores genérico
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✔ El Fogón API escuchando en http://localhost:${PORT}`);
});

// Red de seguridad: si algún handler futuro olvida capturar un error async,
// esto evita que tumbe todo el proceso (y entre en loop de reinicios en
// Railway) — solo lo registra en consola para poder revisarlo.
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection (no debería llegar aquí, revisar el route handler):', err);
});
