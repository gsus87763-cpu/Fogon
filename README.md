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
```

Esto crea la base `el_fogon`, todas las tablas, índices y datos de ejemplo (empleados,
mesas, carta, ingredientes, etc.). **No crea usuarios de login todavía** — eso se hace en el
paso 4 con `npm run seed`, porque las contraseñas deben quedar hasheadas con bcrypt.

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

- El proyecto implementa **CRUD completo con eliminación lógica** en Productos (carta) y
  Clientes. El resto de los módulos (empleados, mesas, etc.) tiene sus tablas, relaciones y
  endpoints de lectura ya modelados en `schema.sql` y las rutas de infraestructura, además
  del CRUD genérico de administración (`/api/admin-tablas/:tabla`) que cubre el resto de
  entidades para el rol admin. Falta construir la pantalla de React que recorra ese CRUD
  genérico de forma dinámica (hoy solo se consume puntualmente, p. ej. en Ambientes).
- El CAPTCHA se genera en memoria en el backend (`utils/captcha.js`) con un TTL de 5 minutos
  y un solo uso por verificación; para un despliegue en producción real conviene moverlo a
  Redis o un servicio equivalente.
- Los montos y precios están en bolivianos (Bs) como referencia; se puede ajustar el símbolo
  de moneda en el frontend según el mercado.

## 9. Migración v2 (julio 2026)

`schema.sql` se quedó desactualizado frente a lo que el backend ya esperaba (carrito de
platos en la reserva, finanzas, login con Google, etc.), lo que producía errores 500 en
`/productos`, `/ambientes` y el registro de cuentas. Esta ronda corrigió eso:

- **Instalación nueva**: importa `backend/schema.sql` completo — ya incluye todo.
- **Base de datos ya existente** (Railway, phpMyAdmin en producción, etc.): ejecuta
  `backend/migracion_v2.sql` una sola vez sobre tu base actual. Es aditivo, no borra ni
  renombra nada de lo que ya tenías.
- Se agregaron/corrigieron: columnas de `empleado.activo`, `mesa.numero`/`activo`,
  `reserva.hora`/`motivo`/`activo`/`fecha_expiracion`, `producto_emplatado` como el plato
  real de carta (con `categoria`, `precio`, `imagen_url`, `cupo_diario`, `estado`), la tabla
  `reserva_producto` (carrito), `ambiente.imagen_url`, columnas de `factura`/`pago_empleado`/
  `detalle_compra` que usa el módulo de finanzas, la tabla `detalle_compra_item`, y las
  funciones/procedimientos `fn_total_reserva`, `sp_generar_factura`,
  `sp_registrar_pago_empleado`.
- Se removió el endpoint `/api/ingredientes` (la entidad INGREDIENTE/COCINA_INGREDIENTE no
  forma parte del proyecto).
- Se conectó `GET /api/auth/captcha` (el frontend ya lo llamaba pero no existía la ruta) y
  ahora `registro`/`login` validan el captcha de verdad.
- Login con Google: ya estaba implementado en el backend (`/api/auth/google`); ahora el botón
  "Continuar con Google" aparece en Login y Registro. Configura `GOOGLE_CLIENT_ID` (backend) y
  `VITE_GOOGLE_CLIENT_ID` (frontend) con el mismo Client ID de Google Cloud Console — si se
  deja vacío, el botón simplemente no se muestra.
- Recuperar contraseña: nuevas páginas `/recuperar-password` y `/restablecer-password` conectadas
  a los endpoints que ya existían en el backend (`/api/auth/recuperar` y `/api/auth/restablecer`).
- Nuevo panel de administración de **Clientes** (`/panel/clientes`, solo admin): CRUD con baja
  lógica + exportar a PDF/Excel.
- Nuevo panel de **Finanzas** (`/panel/finanzas`): pestañas Pago Empleado / Facturas / Detalle
  de Compra, con exportación a PDF/Excel restringida a admin.
- Nuevo panel de **Ambientes** (`/panel/ambientes`, solo admin) para poner imagen y datos de
  cada salón; los platos de la carta (`/panel/productos`) ya tenían campo de imagen, solo
  faltaba la columna en la base de datos.
- `routes/usuarioRoutes.js` y `models/usuarioModel.js` quedan **sin montar a propósito**: son
  de un diseño anterior que asumía tablas `USUARIO`/`ROL` separadas, que este esquema no
  tiene (el rol se resuelve directo contra `CLIENTE`/`EMPLEADO`/`ADMINISTRADOR`/`COCINERO` en
  `authController.js`). Si se quiere una gestión de "usuarios y roles" genérica habría que
  crear esas tablas primero; por ahora el control de clientes se cubre con `/panel/clientes`.
