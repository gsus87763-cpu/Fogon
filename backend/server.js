require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const adminTablasRoutes = require('./routes/adminTablasRoutes');
// PENDIENTES DE PORTAR al nuevo esquema (usan nombres de tabla del diseño
// anterior: RESERVA_PRODUCTO, PRODUCTO con id_carta, etc. — ya no existen así):
// const productoRoutes = require('./routes/productoRoutes');
// const reservaRoutes = require('./routes/reservaRoutes');
// const estadisticaRoutes = require('./routes/estadisticaRoutes');
// const infraestructuraRoutes = require('./routes/infraestructuraRoutes');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ estado: 'ok', servicio: 'El Fogón API' }));

app.use('/api/auth', authRoutes);
app.use('/api/admin-tablas', adminTablasRoutes);

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
