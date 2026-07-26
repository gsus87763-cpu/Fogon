-- =====================================================================
-- EL FOGÓN — Sistema Web de Gestión para Restaurante
-- Script de creación de base de datos (MySQL 8+)
-- =====================================================================

DROP DATABASE IF EXISTS el_fogon;
CREATE DATABASE el_fogon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE el_fogon;

-- =====================================================================
-- MÓDULO: SEGURIDAD / ADMINISTRACIÓN DEL SISTEMA
-- =====================================================================

CREATE TABLE ROL (
  id_rol       INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(40) NOT NULL UNIQUE,      -- admin, salon, cocina, almacen, rrhh, caja, cliente
  descripcion  VARCHAR(150),
  activo       TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE USUARIO (
  id_usuario     INT AUTO_INCREMENT PRIMARY KEY,
  correo         VARCHAR(120) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,           -- bcrypt hash, nunca texto plano
  id_rol         INT NOT NULL,
  id_empleado    INT NULL,                        -- NULL si el usuario es un cliente
  id_cliente     INT NULL,                        -- NULL si el usuario es personal interno
  activo         TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_rol) REFERENCES ROL(id_rol)
);

CREATE TABLE LOG_ACCESO (
  id_log       INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario   INT NULL,
  correo_usado VARCHAR(120),
  tipo_evento  ENUM('INGRESO','SALIDA','INGRESO_FALLIDO') NOT NULL,
  direccion_ip VARCHAR(64),
  user_agent   VARCHAR(255),
  fecha_hora   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
);

-- =====================================================================
-- MÓDULO: PERSONAL / RRHH
-- =====================================================================

CREATE TABLE EMPLEADO (
  id_empleado     INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(80) NOT NULL,
  apellidos       VARCHAR(80) NOT NULL,
  ci              VARCHAR(20) NOT NULL UNIQUE,
  sexo            ENUM('M','F','OTRO'),
  fecha_nacimiento DATE,
  estado_civil    VARCHAR(30),
  telefono        VARCHAR(20),
  cargo           VARCHAR(60) NOT NULL,
  activo          TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE COCINERO (
  id_cocinero  INT AUTO_INCREMENT PRIMARY KEY,
  id_empleado  INT NOT NULL UNIQUE,
  especialidad VARCHAR(80),
  FOREIGN KEY (id_empleado) REFERENCES EMPLEADO(id_empleado)
);

CREATE TABLE ADMINISTRADOR (
  id_administrador INT AUTO_INCREMENT PRIMARY KEY,
  id_empleado      INT NOT NULL UNIQUE,
  FOREIGN KEY (id_empleado) REFERENCES EMPLEADO(id_empleado)
);

CREATE TABLE CONTRATO (
  id_contrato    INT AUTO_INCREMENT PRIMARY KEY,
  id_empleado    INT NOT NULL,
  fecha_firma    DATE NOT NULL,
  estado_vigencia ENUM('VIGENTE','FINALIZADO','SUSPENDIDO') NOT NULL DEFAULT 'VIGENTE',
  tipo           VARCHAR(40),
  FOREIGN KEY (id_empleado) REFERENCES EMPLEADO(id_empleado)
);

CREATE TABLE REGISTRO_CARGO (
  id_registro INT AUTO_INCREMENT PRIMARY KEY,
  id_empleado INT NOT NULL,
  cargo       VARCHAR(60) NOT NULL,
  fecha       DATE NOT NULL,
  FOREIGN KEY (id_empleado) REFERENCES EMPLEADO(id_empleado)
);

CREATE TABLE CERTIFICACION (
  id_certificacion   INT AUTO_INCREMENT PRIMARY KEY,
  id_cocinero        INT NOT NULL,
  nombre_certificacion VARCHAR(100) NOT NULL,
  institucion_emisora VARCHAR(100),
  fecha_fin          DATE,
  FOREIGN KEY (id_cocinero) REFERENCES COCINERO(id_cocinero)
);

CREATE TABLE ASISTENCIA (
  id_asistencia INT AUTO_INCREMENT PRIMARY KEY,
  id_empleado   INT NOT NULL,
  fecha         DATE NOT NULL,
  hora_ingreso  TIME,
  hora_salida   TIME,
  FOREIGN KEY (id_empleado) REFERENCES EMPLEADO(id_empleado)
);

-- =====================================================================
-- MÓDULO: SALÓN / INFRAESTRUCTURA
-- =====================================================================

CREATE TABLE AREA (
  id_area            INT AUTO_INCREMENT PRIMARY KEY,
  nombre             VARCHAR(80) NOT NULL,
  capacidad_integrante INT,
  id_responsable     INT NULL,
  FOREIGN KEY (id_responsable) REFERENCES EMPLEADO(id_empleado)
);

CREATE TABLE AMBIENTE (
  id_ambiente          INT AUTO_INCREMENT PRIMARY KEY,
  nombre               VARCHAR(80) NOT NULL,   -- Salón principal, Terraza, Salón de eventos
  calle                VARCHAR(120),
  horario_funcionamiento VARCHAR(80),
  imagen_url           VARCHAR(500)            -- foto real del ambiente (URL)
);

CREATE TABLE COCINA (
  id_cocina        INT AUTO_INCREMENT PRIMARY KEY,
  id_area          INT NOT NULL,
  cantidad_personal INT DEFAULT 0,
  FOREIGN KEY (id_area) REFERENCES AREA(id_area)
);

CREATE TABLE EQUIPAMIENTO (
  id_equipamiento   INT AUTO_INCREMENT PRIMARY KEY,
  nombre            VARCHAR(80) NOT NULL,
  modelo            VARCHAR(60),
  marca             VARCHAR(60),
  fabricante        VARCHAR(60),
  costo_adquisicion DECIMAL(10,2),
  garantia          VARCHAR(40),
  estado            ENUM('OPERATIVO','MANTENIMIENTO','BAJA') DEFAULT 'OPERATIVO',
  id_area           INT NULL,
  FOREIGN KEY (id_area) REFERENCES AREA(id_area)
);

CREATE TABLE MESA (
  id_mesa         INT AUTO_INCREMENT PRIMARY KEY,
  numero          INT NOT NULL,
  id_ambiente     INT NOT NULL,
  capacidad_maxima INT NOT NULL,
  estado          ENUM('DISPONIBLE','OCUPADA','RESERVADA','INACTIVA') NOT NULL DEFAULT 'DISPONIBLE',
  activo          TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (id_ambiente) REFERENCES AMBIENTE(id_ambiente)
);

-- =====================================================================
-- MÓDULO: COMERCIAL / RESERVAS
-- =====================================================================

CREATE TABLE CLIENTE (
  id_cliente INT AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(80) NOT NULL,
  apellidos  VARCHAR(80) NOT NULL,
  ci         VARCHAR(20) UNIQUE,
  telefono   VARCHAR(20),
  correo     VARCHAR(120) UNIQUE,
  activo     TINYINT(1) NOT NULL DEFAULT 1
);

ALTER TABLE USUARIO
  ADD CONSTRAINT fk_usuario_empleado FOREIGN KEY (id_empleado) REFERENCES EMPLEADO(id_empleado),
  ADD CONSTRAINT fk_usuario_cliente  FOREIGN KEY (id_cliente)  REFERENCES CLIENTE(id_cliente);

CREATE TABLE RESERVA (
  id_reserva       INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente       INT NOT NULL,
  id_mesa          INT NOT NULL,
  fecha            DATE NOT NULL,
  hora             TIME NOT NULL,
  cantidad_personas INT NOT NULL,
  estado           ENUM('PENDIENTE','CONFIRMADA','CANCELADA','COMPLETADA') NOT NULL DEFAULT 'PENDIENTE',
  motivo           VARCHAR(120),
  fecha_expiracion DATETIME,
  activo           TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (id_cliente) REFERENCES CLIENTE(id_cliente),
  FOREIGN KEY (id_mesa) REFERENCES MESA(id_mesa)
);

CREATE TABLE EVENTO (
  id_evento        INT AUTO_INCREMENT PRIMARY KEY,
  nombre           VARCHAR(100) NOT NULL,
  fecha            DATE NOT NULL,
  motivo           VARCHAR(120),
  id_area          INT NOT NULL,
  cantidad_personas INT,
  FOREIGN KEY (id_area) REFERENCES AREA(id_area)
);

CREATE TABLE CARTA (
  id_carta          INT AUTO_INCREMENT PRIMARY KEY,
  nombre            VARCHAR(80) NOT NULL,
  fecha_actualizacion DATE
);

CREATE TABLE PRODUCTO (
  id_producto      INT AUTO_INCREMENT PRIMARY KEY,
  id_carta         INT NOT NULL,
  nombre           VARCHAR(100) NOT NULL,
  descripcion      VARCHAR(255),
  categoria        VARCHAR(60) NOT NULL,       -- Entrada, Plato Fuerte, Postre, Bebida...
  precio           DECIMAL(10,2) NOT NULL,
  unidad_de_medida VARCHAR(30),
  imagen_url       VARCHAR(500),               -- foto real del plato (URL)
  cupo_diario      INT NULL,                   -- NULL = sin límite; si no, cupo máximo reservable por día
  estado           TINYINT(1) NOT NULL DEFAULT 1,  -- soft delete / disponibilidad
  FOREIGN KEY (id_carta) REFERENCES CARTA(id_carta)
);

-- Carrito de platos de una reserva: qué platos y cuántos pidió el cliente al
-- reservar. La disponibilidad diaria de cada producto (cupo_diario) se calcula
-- sumando, para la fecha de hoy, las cantidades de RESERVA_PRODUCTO ligadas a
-- reservas activas (no canceladas) — así el "stock" se reinicia solo cada día,
-- sin necesitar un job de reseteo: la fecha de la reserva ES el reinicio.
-- (Va después de PRODUCTO y RESERVA porque referencia a ambas por FK.)
CREATE TABLE RESERVA_PRODUCTO (
  id_reserva_producto INT AUTO_INCREMENT PRIMARY KEY,
  id_reserva          INT NOT NULL,
  id_producto         INT NOT NULL,
  cantidad            INT NOT NULL DEFAULT 1,
  FOREIGN KEY (id_reserva) REFERENCES RESERVA(id_reserva),
  FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto)
);

-- =====================================================================
-- MÓDULO: ALMACÉN / COMPRAS
-- =====================================================================

CREATE TABLE INGREDIENTE (
  id_ingrediente INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  unidad_medida  VARCHAR(30) NOT NULL,
  stock_minimo   DECIMAL(10,2) DEFAULT 0,
  stock_actual   DECIMAL(10,2) DEFAULT 0,
  activo         TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE ALMACEN (
  id_almacen     INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(80) NOT NULL,
  proveedor      VARCHAR(100),
  id_responsable INT NULL,
  FOREIGN KEY (id_responsable) REFERENCES EMPLEADO(id_empleado)
);

CREATE TABLE DETALLE_COMPRA (
  id_detalle    INT AUTO_INCREMENT PRIMARY KEY,
  id_almacen    INT NOT NULL,
  proveedor     VARCHAR(100) NOT NULL,
  fecha_emision DATE NOT NULL,
  monto         DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (id_almacen) REFERENCES ALMACEN(id_almacen)
);

CREATE TABLE DETALLE_COMPRA_PRODUCTO (
  id_detalle_p    INT AUTO_INCREMENT PRIMARY KEY,
  id_detalle      INT NOT NULL,
  id_ingrediente  INT NOT NULL,
  cantidad        DECIMAL(10,2) NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (id_detalle) REFERENCES DETALLE_COMPRA(id_detalle),
  FOREIGN KEY (id_ingrediente) REFERENCES INGREDIENTE(id_ingrediente)
);

-- Uso de ingredientes/equipamiento en cocina (relaciones "utiliza")
CREATE TABLE COCINA_INGREDIENTE (
  id_cocina      INT NOT NULL,
  id_ingrediente INT NOT NULL,
  cantidad_diaria DECIMAL(10,2),
  PRIMARY KEY (id_cocina, id_ingrediente),
  FOREIGN KEY (id_cocina) REFERENCES COCINA(id_cocina),
  FOREIGN KEY (id_ingrediente) REFERENCES INGREDIENTE(id_ingrediente)
);

CREATE TABLE COCINA_EQUIPAMIENTO (
  id_cocina        INT NOT NULL,
  id_equipamiento  INT NOT NULL,
  PRIMARY KEY (id_cocina, id_equipamiento),
  FOREIGN KEY (id_cocina) REFERENCES COCINA(id_cocina),
  FOREIGN KEY (id_equipamiento) REFERENCES EQUIPAMIENTO(id_equipamiento)
);

-- =====================================================================
-- MÓDULO: FINANZAS / CAJA
-- =====================================================================

CREATE TABLE RECURSO_MONETARIO (
  id_recurso  INT AUTO_INCREMENT PRIMARY KEY,
  tipo        ENUM('INGRESO','EGRESO') NOT NULL,
  concepto    VARCHAR(120),
  monto       DECIMAL(10,2) NOT NULL,
  fecha       DATE NOT NULL,
  id_empleado INT NULL,
  FOREIGN KEY (id_empleado) REFERENCES EMPLEADO(id_empleado)
);

-- =====================================================================
-- ÍNDICES ÚTILES
-- =====================================================================
CREATE INDEX idx_reserva_fecha ON RESERVA(fecha);
CREATE INDEX idx_mesa_ambiente ON MESA(id_ambiente);
CREATE INDEX idx_producto_carta ON PRODUCTO(id_carta);
CREATE INDEX idx_log_usuario ON LOG_ACCESO(id_usuario);

-- =====================================================================
-- DATOS DE EJEMPLO
-- =====================================================================

INSERT INTO ROL (nombre, descripcion) VALUES
 ('admin','Administrador del sistema'),
 ('salon','Encargado de salón / anfitrión'),
 ('cocina','Cocinero / Chef'),
 ('almacen','Encargado de almacén'),
 ('rrhh','Recursos Humanos'),
 ('caja','Cajero'),
 ('cliente','Cliente registrado');

INSERT INTO EMPLEADO (nombre, apellidos, ci, sexo, fecha_nacimiento, estado_civil, telefono, cargo) VALUES
 ('Marcelo','Rojas Quispe','5541223','M','1985-03-12','Casado','70011122','Administrador General'),
 ('Andrea','Fernández Paz','6782341','F','1990-07-22','Soltera','71122334','Chef Ejecutiva'),
 ('Luis','Mamani Choque','4498212','M','1988-11-02','Soltero','72233445','Encargado de Salón'),
 ('Carla','Vargas Soliz','7891234','F','1993-05-30','Casada','73344556','Encargada de Almacén'),
 ('Jorge','Quiroga Terán','3321987','M','1979-09-15','Casado','74455667','Cajero');

INSERT INTO ADMINISTRADOR (id_empleado) VALUES (1);
INSERT INTO COCINERO (id_empleado, especialidad) VALUES (2,'Cocina de autor / parrilla');

INSERT INTO CONTRATO (id_empleado, fecha_firma, estado_vigencia, tipo) VALUES
 (1,'2020-01-10','VIGENTE','Indefinido'),
 (2,'2021-03-01','VIGENTE','Indefinido'),
 (3,'2022-06-15','VIGENTE','Plazo fijo'),
 (4,'2022-06-15','VIGENTE','Plazo fijo'),
 (5,'2023-02-01','VIGENTE','Indefinido');

INSERT INTO CERTIFICACION (id_cocinero, nombre_certificacion, institucion_emisora, fecha_fin) VALUES
 (1,'Manipulación de alimentos','Instituto Gastronómico Boliviano','2027-01-01'),
 (1,'Curso avanzado de parrilla','Le Cordon Bleu','2026-12-01');

INSERT INTO AMBIENTE (nombre, calle, horario_funcionamiento, imagen_url) VALUES
 ('Salón Principal','Av. Arce 2100','12:00 - 23:00','https://images.unsplash.com/photo-1701722952679-beffce26d77a?auto=format&fit=crop&q=80&w=1000'),
 ('Terraza','Av. Arce 2100','12:00 - 22:00','https://images.unsplash.com/photo-1756680967373-c3205a8a8b31?auto=format&fit=crop&q=80&w=1000'),
 ('Salón de Eventos','Av. Arce 2100','Reserva previa','https://images.unsplash.com/photo-1762765685319-fdaf8d22085d?auto=format&fit=crop&q=80&w=1000');

INSERT INTO AREA (nombre, capacidad_integrante, id_responsable) VALUES
 ('Cocina Principal',8,2),
 ('Salón',6,3),
 ('Almacén',3,4);

INSERT INTO COCINA (id_area, cantidad_personal) VALUES (1,6);

INSERT INTO EQUIPAMIENTO (nombre, modelo, marca, fabricante, costo_adquisicion, garantia, estado, id_area) VALUES
 ('Horno industrial','HX-200','RationalTech','Rational GmbH',18500.00,'24 meses','OPERATIVO',1),
 ('Cámara de frío','CF-500','FrioMax','FrioMax Bolivia',9200.00,'12 meses','OPERATIVO',1),
 ('Parrilla a gas','PG-100','GrillPro','GrillPro SA',4300.00,'6 meses','OPERATIVO',1);

INSERT INTO MESA (numero, id_ambiente, capacidad_maxima, estado) VALUES
 (1,1,2,'DISPONIBLE'),(2,1,4,'DISPONIBLE'),(3,1,4,'DISPONIBLE'),(4,1,6,'DISPONIBLE'),
 (1,2,4,'DISPONIBLE'),(2,2,4,'DISPONIBLE'),
 (1,3,20,'DISPONIBLE');

INSERT INTO CARTA (nombre, fecha_actualizacion) VALUES
 ('Carta Temporada 2026', CURDATE()),
 ('Carta de Postres y Bebidas', CURDATE());

-- Platos con imagen_url (fotografía real, licencia libre) y cupo_diario definido
-- se muestran con foto en el carrito de reserva; el resto usa el respaldo visual
-- (franja de textura) en el frontend hasta que se les cargue una foto propia.
INSERT INTO PRODUCTO (id_carta, nombre, descripcion, categoria, precio, unidad_de_medida, imagen_url, cupo_diario, estado) VALUES
 -- Entradas
 (1,'Sopa de Maní','Clásica sopa boliviana con maní y carne de res','Entrada',28.00,'porción','https://images.unsplash.com/photo-1665594051407-7385d281ad76?auto=format&fit=crop&q=80&w=800',NULL,1),
 (1,'Empanadas Salteñas','Trío de empanadas jugosas horneadas al momento','Entrada',22.00,'porción','https://images.unsplash.com/photo-1548228586-171fb0887ac0?auto=format&fit=crop&q=80&w=800',40,1),
 (1,'Ensalada de Quinua','Quinua real, palta, tomate cherry y vinagreta de limón','Entrada',26.00,'porción',NULL,NULL,1),
 (1,'Choclo con Queso','Choclo tierno al vapor con queso criollo','Entrada',18.00,'porción',NULL,NULL,1),
 -- Platos fuertes
 (1,'Picante de Pollo','Pollo en salsa picante con papa y arroz','Plato Fuerte',55.00,'porción','https://images.unsplash.com/photo-1708782344490-9026aaa5eec7?auto=format&fit=crop&q=80&w=800',NULL,1),
 (1,'Parrillada El Fogón','Selección de carnes a la parrilla para compartir','Plato Fuerte',120.00,'porción','https://images.unsplash.com/photo-1774668748614-f188f5b61535?auto=format&fit=crop&q=80&w=800',15,1),
 (1,'Silpancho El Fogón','Carne apanada sobre arroz, papa y huevo frito','Plato Fuerte',58.00,'porción','https://images.unsplash.com/photo-1543900348-f03d06be7653?auto=format&fit=crop&q=80&w=800',25,1),
 (1,'Trucha a la Plancha','Trucha de lago con guarnición de temporada','Plato Fuerte',68.00,'porción',NULL,20,1),
 (1,'Lomo Montado','Lomo fino con huevo, plátano frito y arroz','Plato Fuerte',62.00,'porción',NULL,NULL,1),
 (1,'Pique Macho para Compartir','Carne, salchicha, papas fritas y verduras salteadas','Plato Fuerte',95.00,'porción',NULL,12,1),
 -- Postres
 (2,'Tiramisú de la Casa','Postre italiano con receta propia','Postre',24.00,'porción','https://images.unsplash.com/photo-1746888151121-1002113ed286?auto=format&fit=crop&q=80&w=800',NULL,1),
 (2,'Helado Artesanal','Tres bochas a elección, sabores de temporada','Postre',20.00,'porción',NULL,NULL,1),
 (2,'Keke de Chocolate','Keke húmedo de chocolate con salsa tibia','Postre',22.00,'porción',NULL,NULL,1),
 -- Bebidas
 (2,'Limonada de Coco','Bebida refrescante artesanal','Bebida',16.00,'vaso','https://images.unsplash.com/photo-1754594537133-796eb54f206c?auto=format&fit=crop&q=80&w=800',NULL,1),
 (2,'Jugo de Temporada','Jugo natural de fruta fresca del día','Bebida',14.00,'vaso',NULL,NULL,1),
 (2,'Cerveza Artesanal El Fogón','Producción local, estilo ale','Bebida',25.00,'pinta',NULL,30,1),
 (2,'Copa de Vino de la Casa','Selección de vinos bolivianos por copa','Bebida',35.00,'copa',NULL,NULL,1),
 -- Adicionales
 (1,'Pan de la Casa','Pan artesanal horneado a diario, con mantequilla de hierbas','Adicional',12.00,'porción',NULL,NULL,1),
 (1,'Papas Fritas El Fogón','Papas rústicas con especias de la casa','Adicional',18.00,'porción',NULL,NULL,1);

INSERT INTO CLIENTE (nombre, apellidos, ci, telefono, correo) VALUES
 ('Paola','Gutiérrez Mamani','8891234','76655443','paola.gutierrez@example.com'),
 ('Sergio','Aramayo Flores','9021233','77788990','sergio.aramayo@example.com');

INSERT INTO INGREDIENTE (nombre, unidad_medida, stock_minimo, stock_actual) VALUES
 ('Carne de res','kg',10,45),
 ('Maní','kg',5,20),
 ('Pollo','kg',15,60),
 ('Papa','kg',20,80);

INSERT INTO ALMACEN (nombre, proveedor, id_responsable) VALUES
 ('Almacén Central','Distribuidora La Paceña',4);

INSERT INTO DETALLE_COMPRA (id_almacen, proveedor, fecha_emision, monto) VALUES
 (1,'Distribuidora La Paceña','2026-07-01',2450.00);

INSERT INTO DETALLE_COMPRA_PRODUCTO (id_detalle, id_ingrediente, cantidad, precio_unitario) VALUES
 (1,1,30,35.00),
 (1,3,40,18.00);

INSERT INTO RECURSO_MONETARIO (tipo, concepto, monto, fecha, id_empleado) VALUES
 ('INGRESO','Ventas del día','3200.00','2026-07-20',5),
 ('EGRESO','Compra de insumos','2450.00','2026-07-20',5);

-- Usuarios de prueba (password real se crea vía script seed.js con bcrypt, ver README)
