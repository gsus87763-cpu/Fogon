# Diccionario de Datos — EL FOGÓN

Basado en `backend/schema.sql`. PK = llave primaria, FK = llave foránea.

## Módulo: Seguridad / Administración

### ROL
| Campo | Tipo | Restricción |
|---|---|---|
| id_rol | INT | PK, AUTO_INCREMENT |
| nombre | VARCHAR(40) | NOT NULL, UNIQUE |
| descripcion | VARCHAR(150) | |
| activo | TINYINT(1) | DEFAULT 1 |

### USUARIO
| Campo | Tipo | Restricción |
|---|---|---|
| id_usuario | INT | PK, AUTO_INCREMENT |
| correo | VARCHAR(120) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL (bcrypt, nunca texto plano) |
| id_rol | INT | FK → ROL |
| id_empleado | INT NULL | FK → EMPLEADO (personal interno) |
| id_cliente | INT NULL | FK → CLIENTE (usuarios tipo cliente) |
| activo | TINYINT(1) | DEFAULT 1 |
| fecha_creacion | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### LOG_ACCESO
| Campo | Tipo | Restricción |
|---|---|---|
| id_log | INT | PK, AUTO_INCREMENT |
| id_usuario | INT NULL | FK → USUARIO |
| correo_usado | VARCHAR(120) | |
| tipo_evento | ENUM | INGRESO / SALIDA / INGRESO_FALLIDO |
| direccion_ip | VARCHAR(64) | |
| user_agent | VARCHAR(255) | |
| fecha_hora | DATETIME | DEFAULT CURRENT_TIMESTAMP |

## Módulo: Personal / RRHH

### EMPLEADO
id_empleado (PK), nombre, apellidos, ci (UNIQUE), sexo, fecha_nacimiento, estado_civil, telefono, cargo, activo.

### COCINERO (especialización de EMPLEADO)
id_cocinero (PK), id_empleado (FK, UNIQUE), especialidad.

### ADMINISTRADOR (especialización de EMPLEADO)
id_administrador (PK), id_empleado (FK, UNIQUE).

### CONTRATO
id_contrato (PK), id_empleado (FK), fecha_firma, estado_vigencia (VIGENTE/FINALIZADO/SUSPENDIDO), tipo.

### REGISTRO_CARGO
id_registro (PK), id_empleado (FK), cargo, fecha.

### CERTIFICACION
id_certificacion (PK), id_cocinero (FK), nombre_certificacion, institucion_emisora, fecha_fin.

### ASISTENCIA
id_asistencia (PK), id_empleado (FK), fecha, hora_ingreso, hora_salida.

## Módulo: Salón / Infraestructura

### AREA
id_area (PK), nombre, capacidad_integrante, id_responsable (FK → EMPLEADO).

### AMBIENTE
id_ambiente (PK), nombre, calle, horario_funcionamiento.

### COCINA
id_cocina (PK), id_area (FK), cantidad_personal.

### EQUIPAMIENTO
id_equipamiento (PK), nombre, modelo, marca, fabricante, costo_adquisicion, garantia, estado (OPERATIVO/MANTENIMIENTO/BAJA), id_area (FK).

### MESA
id_mesa (PK), numero, id_ambiente (FK), capacidad_maxima, estado (DISPONIBLE/OCUPADA/RESERVADA/INACTIVA), activo.

## Módulo: Comercial / Reservas

### CLIENTE
id_cliente (PK), nombre, apellidos, ci (UNIQUE), telefono, correo (UNIQUE), activo.

### RESERVA
id_reserva (PK), id_cliente (FK), id_mesa (FK), fecha, hora, cantidad_personas, estado (PENDIENTE/CONFIRMADA/CANCELADA/COMPLETADA), motivo, fecha_expiracion, activo.

### EVENTO
id_evento (PK), nombre, fecha, motivo, id_area (FK), cantidad_personas.

### CARTA
id_carta (PK), nombre, fecha_actualizacion.

### PRODUCTO
id_producto (PK), id_carta (FK), nombre, descripcion, categoria, precio, unidad_de_medida, estado (soft delete: 1 = visible, 0 = desactivado).

## Módulo: Almacén / Compras

### INGREDIENTE
id_ingrediente (PK), nombre, unidad_medida, stock_minimo, stock_actual, activo.

### ALMACEN
id_almacen (PK), nombre, proveedor, id_responsable (FK → EMPLEADO).

### DETALLE_COMPRA
id_detalle (PK), id_almacen (FK), proveedor, fecha_emision, monto.

### DETALLE_COMPRA_PRODUCTO
id_detalle_p (PK), id_detalle (FK), id_ingrediente (FK), cantidad, precio_unitario.

### COCINA_INGREDIENTE (relación "utiliza")
id_cocina (FK, PK compuesta), id_ingrediente (FK, PK compuesta), cantidad_diaria.

### COCINA_EQUIPAMIENTO (relación "utiliza")
id_cocina (FK, PK compuesta), id_equipamiento (FK, PK compuesta).

## Módulo: Finanzas

### RECURSO_MONETARIO
id_recurso (PK), tipo (INGRESO/EGRESO), concepto, monto, fecha, id_empleado (FK).

---

## Relaciones principales

| Relación | Cardinalidad |
|---|---|
| ADMINISTRADOR supervisa AREA / EMPLEADO | 1:N |
| COCINERO posee CERTIFICACION | 1:N |
| COCINA utiliza EQUIPAMIENTO / INGREDIENTE | N:M |
| CARTA contiene PRODUCTO | 1:N |
| ALMACEN almacena INGREDIENTE | 1:N |
| DETALLE_COMPRA conforma DETALLE_COMPRA_PRODUCTO | 1:N |
| CLIENTE tiene RESERVA | 1:N |
| RESERVA ocupa MESA | N:1 |
| MESA pertenece a AMBIENTE | N:1 |
| EQUIPAMIENTO se ubica en AREA | N:1 |
| ALMACEN distribuye INGREDIENTE hacia COCINA | N:M |
