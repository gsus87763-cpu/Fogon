# EL FOGÓN — Sistema Web de Gestión para Restaurante

Aplicación web integral para el restaurante **El Fogón**: sitio público (carta digital,
reservas, eventos) y paneles internos por rol (administración, salón, cocina, almacén, caja),
sobre una base de datos relacional en MySQL.

- **Frontend:** React + Vite (`/frontend`)
- **Backend:** NodeJS + Express, API REST (`/backend`)
- **Base de datos:** MySQL (`/backend/schema.sql`)
- **Documentación:** diccionario de datos y diagrama ER (`/docs`)

---

## 1. Requisitos previos

- Node.js 18 o superior
- MySQL 8 (o compatible) corriendo localmente o accesible por red
- npm

---

## 2. Base de datos

```bash
mysql -u root -p < backend/schema.sql
mysql -u root -p < backend/migracion_v2.sql
mysql -u root -p < backend/migracion_v3.sql
mysql -u root -p < backend/migracion_v4.sql
mysql -u root -p < backend/migracion_v5.sql
```

Esto crea la base `el_fogon`, todas las tablas, índices y datos de ejemplo (empleados,
mesas, carta, ingredientes, etc.), y luego aplica las migraciones que agregan reservas con
carrito de platos y cupo diario (`migracion_v2.sql`), el QR de pago de reservas
(`migracion_v3.sql`) y el registro de personal con aprobación (`migracion_v4.sql` y
`migracion_v5.sql`) — en ese orden, porque cada una depende de la anterior. **No crea usuarios
de login todavía** — eso se hace en el paso 4 con `npm run seed`, porque las contraseñas deben
quedar hasheadas con bcrypt.

---

## 3. Backend

```bash
cd backend
cp .env.example .env
# Edita .env con tus credenciales de MySQL y un JWT_SECRET propio
npm install
npm run seed     # crea los usuarios de prueba (ver tabla de credenciales abajo)
npm run dev      # o: npm start
```

La API queda disponible en `http://localhost:4000/api`. Puedes verificarla en
`http://localhost:4000/api/health`.

---

## 4. Frontend

```bash
cd frontend
cp .env.example .env
# Por defecto ya apunta a http://localhost:4000/api
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

---

## 5. Credenciales de usuarios de prueba

Creadas por `npm run seed` en el backend:

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@elfogon.com | Admin#2026 |
| Salón / Anfitrión | salon@elfogon.com | Salon#2026 |
| Cocinero / Chef | cocina@elfogon.com | Cocina#2026 |
| Encargado de Almacén | almacen@elfogon.com | Almacen#2026 |
| Cajero | caja@elfogon.com | Caja#2026 |
| Cliente | cliente@elfogon.com | Cliente#2026 |

También puedes registrar un cliente nuevo desde `/registro` en el sitio público.

---

## 6. Requisitos técnicos obligatorios — dónde encontrarlos

| # | Requisito | Ubicación |
|---|---|---|
| 1 | Menú de navegación + carta digital | `frontend/src/components/Navbar.jsx`, `frontend/src/pages/Carta.jsx` |
| 2 | CRUD con eliminación lógica | Módulo Productos: `backend/controllers/productoController.js` + `frontend/src/pages/PanelProductos.jsx` |
| 3 | Frontend en React | `/frontend` (React Router, componentes reutilizables, axios) |
| 4 | Backend en NodeJS/Express | `/backend` (rutas/controladores/modelos) |
| 5 | Validaciones frontend + backend | `middlewares/validarProducto.js`, validación de reservas en `reservaController.js`, validación en formularios React |
| 6 | Reporte PDF dinámico | `backend/controllers/reporteController.js` (pdfkit) + botón de descarga en `PanelEstadisticas.jsx` |
| 7 | Gráfico estadístico | `backend/controllers/estadisticaController.js` + `recharts` en `PanelEstadisticas.jsx` |
| 8 | Login con roles + CAPTCHA | `backend/utils/captcha.js`, `authController.js`, `frontend/src/pages/Login.jsx` |
| 9 | Fortaleza de contraseña + hash bcrypt | `backend/utils/passwordStrength.js`, `frontend/src/pages/Registro.jsx` |
| 10 | Log de accesos | `backend/utils/logAcceso.js`, tabla `LOG_ACCESO` |
| 11 | Base de datos MySQL | `backend/schema.sql` |

---

## 6bis. Funcionalidades agregadas en esta iteración

- **CAPTCHA también en el login** (antes solo estaba en el registro): `backend/controllers/authController.js`
  (`login`) exige `captchaId` + `captchaRespuesta`, igual que el registro; UI en `frontend/src/pages/Login.jsx`.
- **Reserva con QR de pago**: al crear una reserva (`POST /api/reservas`, solo clientes), el backend
  calcula un monto a cobrar (el total del carrito de platos anticipados, o una seña mínima por
  persona — `RESERVA_SENA_POR_PERSONA` en `.env` — si no alcanza) y genera automáticamente una
  solicitud de cobro con un código único (`backend/models/reservaModel.js`, tabla `pago_reserva` de
  `backend/migracion_v3.sql`).
- **Comprobante en PDF con QR**: `GET /api/reservas/:id/pago/comprobante` genera un PDF (pdfkit) con
  fecha, hora, mesa, ambiente, personas, monto y un código QR (`backend/utils/qrPago.js`, librería
  `qrcode`) con todos esos datos firmados. El cliente lo descarga desde "Mis reservas"
  (`frontend/src/pages/Reservas.jsx`).
- **Aprobación/rechazo del pago**: el personal de caja/salón/admin verifica el código del QR desde
  `PanelReservasSalon.jsx` y llama a `POST /api/reservas/:id/pago/resolver { codigo, aprobar }`.
  Si se aprueba, la reserva pasa automáticamente a `CONFIRMADA` (queda activa) y se genera su
  factura reutilizando `sp_generar_factura`; si se rechaza, el cliente puede regenerar un QR nuevo
  (`POST /api/reservas/:id/pago/regenerar`).
- Requiere ejecutar `backend/migracion_v3.sql` sobre la base de datos (después de
  `migracion_v2.sql`, del cual depende).
- **Notificaciones por correo**: al aprobar/rechazar el pago de una reserva, el cliente recibe un
  correo automático (`backend/utils/mailer.js`); si no hay SMTP configurado en `.env`, el correo
  se imprime en la consola del backend (modo desarrollo).
- **Registro de personal con aprobación**: `POST /api/auth/registro-empleado` (con CAPTCHA) crea un
  empleado en estado `Pendiente`. Al postular, o al intentar iniciar sesión mientras está pendiente
  o fue rechazado, el frontend muestra una página dedicada (`SolicitudEstado.jsx`, ruta
  `/solicitud-personal`) — no un simple mensaje de error — con "tu solicitud está en revisión" o el
  motivo del rechazo. El login primero valida la contraseña y recién después revela el estado, para
  no filtrar si un correo existe.
  Un administrador aprueba o rechaza desde `PanelSolicitudesEmpleados.jsx`
  (`GET/PATCH /api/empleados`, `backend/controllers/empleadoController.js`). Al aprobar se elige el
  rol de trabajo — `staff`, `admin`, `cocina`, `salon` (agente que atiende mesas/reservas), `caja`,
  `almacen` o `rrhh` — que se guarda en `empleado.rol_manual` (migración `migracion_v5.sql`) y decide
  a qué panel entra (p. ej. un agente de salón va directo a "Reservas y mesas", un cocinero a
  "Productos"). Al aprobar/rechazar se le notifica por correo.
  Requiere `backend/migracion_v4.sql` (agrega `empleado.motivo_rechazo`) y `migracion_v5.sql`
  (agrega `empleado.rol_manual`), después de `migracion_v2.sql` y `migracion_v3.sql`.
- **Importante — rutas que estaban desconectadas**: `reservaRoutes`, `financeRoutes` y
  `estadisticaRoutes` existían en el código pero no estaban montadas en `server.js` (quedaron
  comentadas de una migración de esquema anterior). Ya están montadas (`/api/reservas`,
  `/api/finanzas`, `/api/estadisticas`) — sin esto, reservas, pagos, facturas, compras y reportes
  no eran alcanzables por la API aunque el código existiera.

- **Modo claro/oscuro**: botón en la navbar, persistido en `localStorage`, respeta la preferencia
  del sistema operativo la primera vez (`frontend/src/context/ThemeContext.jsx`).
- **Carrito de platos para la reserva** (no es un carrito de compra/pago): el cliente arma su
  reserva y opcionalmente agrega platos desde la Carta o el modal de producto; el carrito vive en
  `frontend/src/context/CarritoContext.jsx` y se envía junto con la reserva.
- **Cupos diarios por plato**: columna `cupo_diario` en `PRODUCTO` + tabla `RESERVA_PRODUCTO`.
  La disponibilidad de "hoy" se calcula sumando las reservas activas de la fecha actual — por eso
  el stock se "reinicia" solo cada día, sin necesitar un job de reseteo: apenas cambia la fecha,
  el cálculo vuelve a partir de cero. La validación de cupo ocurre en una transacción con bloqueo
  de fila (`SELECT ... FOR UPDATE`) para evitar que dos reservas simultáneas sobrepasen el cupo.
- **Imágenes reales por URL**: `imagen_url` en `PRODUCTO` y `AMBIENTE` (fotografías de Unsplash,
  licencia libre). 18 platos sembrados en 2 cartas, con fotos en 7 de ellos.
- **Modal de zoom** al hacer clic en una tarjeta de la Carta: imagen grande, descripción completa,
  cupo restante del día y botón para agregar al carrito.
- **Hero de Inicio a pantalla completa** con imagen de fondo temática y la navbar transparente que
  aparece con fondo al hacer scroll.
- **Footer ampliado**: WhatsApp, correo, redes sociales y horario por día.

---

## 7. Estructura del proyecto

```
el-fogon/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── schema.sql
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/theme.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── docs/
    ├── diccionario_datos.md
    └── diagrama_er.svg
```

---

## 8. Notas y alcance académico

- El proyecto implementa **un módulo CRUD completo con eliminación lógica** (Productos),
  como exige la consigna. El resto de los módulos (empleados, ingredientes, mesas, etc.)
  tiene sus tablas, relaciones y endpoints de lectura ya modelados en `schema.sql` y las
  rutas de infraestructura, listos para ampliarse con el mismo patrón (modelo → validación
  → controlador → rutas → página React) si se requiere CRUD completo en más módulos.
- El CAPTCHA se genera en memoria en el backend (`utils/captcha.js`) con un TTL de 5 minutos
  y un solo uso por verificación; para un despliegue en producción real conviene moverlo a
  Redis o un servicio equivalente.
- Los montos y precios están en bolivianos (Bs) como referencia; se puede ajustar el símbolo
  de moneda en el frontend según el mercado.
