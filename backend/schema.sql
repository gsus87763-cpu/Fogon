-- =====================================================================
-- EL FOGÓN — Base de datos (versión oficial del equipo + extensiones)
-- =====================================================================
DROP DATABASE IF EXISTS railway;
CREATE DATABASE railway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE railway;

-- phpMyAdmin SQL Dump (fuente: dump real del equipo, tablas en minúscula)
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `administrador` (
  `id_administrador` int(11) NOT NULL,
  `id_empleado` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `administrador` (`id_administrador`, `id_empleado`) VALUES
(1, 1);

CREATE TABLE `almacen` (
  `id_almacen` int(11) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `id_responsable` int(11) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `descripción` varchar(50) DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `capacidad_maxima` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `almacen` (`id_almacen`, `nombre`, `id_responsable`, `tipo`, `descripción`, `estado`, `capacidad_maxima`) VALUES
(1, 'Almacén Central', 4, NULL, NULL, NULL, 0);

CREATE TABLE `ambiente` (
  `id_ambiente` int(11) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `horario_funcionamiento` varchar(80) DEFAULT NULL,
  `caracteristica` varchar(50) DEFAULT NULL,
  `capacidad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `ambiente` (`id_ambiente`, `nombre`, `horario_funcionamiento`, `caracteristica`, `capacidad`) VALUES
(1, 'Salón Principal', '12:00 - 23:00', NULL, 0),
(2, 'Terraza', '12:00 - 22:00', NULL, 0),
(3, 'Salón de Eventos', 'Reserva previa', NULL, 0),
(4, 'Patio Jardin', '10:00 - 21:00', 'Area verde', 35),
(5, 'Salon Ejecutivo', '11:00 - 22:00', 'Reuniones', 24),
(6, 'Area Infantil', '09:00 - 20:00', 'Juegos para niños', 30),
(7, 'Salon de Eventos', '08:00 - 00:00', 'Eventos especiales', 120),
(8, 'Comedor Secundario', '08:00 - 22:00', 'Servicio general', 50),
(9, 'Salon VIP', '12:00 - 23:00', 'Privado', 20),
(10, 'Terraza', '09:00 - 22:00', 'Aire libre', 40),
(11, 'Salon Principal', '08:00 - 23:00', 'Familiar', 80);

CREATE TABLE `area` (
  `id_area` int(11) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `capacidad_personal` int(11) DEFAULT NULL,
  `id_responsable` int(11) DEFAULT NULL,
  `objetivo` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `area` (`id_area`, `nombre`, `capacidad_personal`, `id_responsable`, `objetivo`) VALUES
(1, 'Cocina Principal', 8, 2, NULL),
(2, 'Salón', 6, 3, NULL),
(3, 'Almacén', 3, 4, NULL),
(4, 'Administración', 8, 1, 'Gestionar los recursos administrativos, financieros y operativos del restaurante'),
(5, 'Recursos Humanos', 4, 8, 'Administrar la contratación, capacitación y bienestar del personal'),
(6, 'Almacén', 5, 4, 'Controlar el inventario y abastecimiento de insumos y materiales'),
(7, 'Atención al Cliente', 10, 6, 'Brindar una atención eficiente y garantizar la satisfacción del cliente');

CREATE TABLE `asistencia` (
  `id_asistencia` int(11) NOT NULL,
  `id_empleado` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora_ingreso` time DEFAULT NULL,
  `hora_salida` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `carta` (
  `id_carta` int(11) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `descripción` varchar(150) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `carta` (`id_carta`, `nombre`, `descripción`, `tipo`) VALUES
(1, 'Carta Temporada 2026', NULL, NULL),
(2, 'Carta de Postres y Bebidas', NULL, NULL);

CREATE TABLE `certificacion` (
  `id_certificacion` int(11) NOT NULL,
  `id_cocinero` int(11) NOT NULL,
  `nombre_certificacion` varchar(100) NOT NULL,
  `institucion_emisora` varchar(100) DEFAULT NULL,
  `fecha_expiracion` date DEFAULT NULL,
  `fecha_emision` date DEFAULT NULL,
  `nivel` varchar(50) DEFAULT NULL,
  `estado_vigencia` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `certificacion` (`id_certificacion`, `id_cocinero`, `nombre_certificacion`, `institucion_emisora`, `fecha_expiracion`, `fecha_emision`, `nivel`, `estado_vigencia`) VALUES
(1, 1, 'Manipulación de alimentos', 'Instituto Gastronómico Boliviano', '2027-01-01', NULL, NULL, NULL),
(2, 1, 'Curso avanzado de parrilla', 'Le Cordon Bleu', '2026-12-01', NULL, NULL, NULL);

CREATE TABLE `cliente` (
  `id_cliente` int(11) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `apellidos` varchar(80) NOT NULL,
  `ci` varchar(20) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(120) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `contrasenia` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `cliente` (`id_cliente`, `nombre`, `apellidos`, `ci`, `telefono`, `correo`, `fecha_nacimiento`, `contrasenia`) VALUES
(1, 'Paola', 'Gutiérrez Mamani', '8891234', '76655443', 'paola.gutierrez@example.com', NULL, NULL),
(2, 'Sergio', 'Aramayo Flores', '9021233', '77788990', 'sergio.aramayo@example.com', NULL, NULL);

CREATE TABLE `cocina` (
  `id_cocina` int(11) NOT NULL,
  `id_area` int(11) NOT NULL,
  `cantidad_personal` int(11) DEFAULT 0,
  `nombre` varchar(50) DEFAULT NULL,
  `descripcion_funcion` varchar(50) DEFAULT NULL,
  `estado` varchar(100) DEFAULT NULL,
  `horario_funcionamiento` varchar(50) DEFAULT NULL,
  `id_responsable` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `cocina` (`id_cocina`, `id_area`, `cantidad_personal`, `nombre`, `descripcion_funcion`, `estado`, `horario_funcionamiento`, `id_responsable`) VALUES
(1, 1, 6, NULL, NULL, NULL, NULL, NULL);

CREATE TABLE `cocinero` (
  `id_cocinero` int(11) NOT NULL,
  `id_empleado` int(11) NOT NULL,
  `especialidad` varchar(80) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `cocinero` (`id_cocinero`, `id_empleado`, `especialidad`) VALUES
(1, 2, 'Cocina de autor / parrilla'),
(5, 5, 'Comida Tradicional Boliviana'),
(6, 3, 'Repostería'),
(7, 7, 'Panadería Artesanal');

CREATE TABLE `conforma` (
  `id_cocinero` int(11) NOT NULL,
  `id_cocina` int(11) NOT NULL,
  `id_contrato` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `contrato` (
  `id_contrato` int(11) NOT NULL,
  `fecha_firma` date NOT NULL,
  `estado` enum('VIGENTE','FINALIZADO','SUSPENDIDO') NOT NULL DEFAULT 'VIGENTE',
  `objeto_contrato` varchar(150) DEFAULT NULL,
  `fecha_ini` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `monto` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `contrato` (`id_contrato`, `fecha_firma`, `estado`, `objeto_contrato`, `fecha_ini`, `fecha_fin`, `monto`) VALUES
(1, '2025-01-02', 'VIGENTE', 'Prestación de servicios administrativos', '2025-01-05', '2026-01-04', 7000.00),
(2, '2025-01-03', 'VIGENTE', 'Prestación de servicios gastronómicos', '2025-01-06', '2026-01-05', 5000.00),
(3, '2025-01-05', 'VIGENTE', 'Administración de recursos humanos', '2025-01-08', '2026-01-07', 6000.00),
(4, '2025-01-08', 'VIGENTE', 'Supervisión de operaciones del restaurante', '2025-01-10', '2026-01-09', 6000.00),
(5, '2025-01-10', 'FINALIZADO', 'Administración de compras e inventarios', '2024-01-15', '2025-01-14', 5000.00),
(6, '2025-01-12', 'SUSPENDIDO', 'Gestión comercial y atención institucional', '2025-01-15', '2026-01-14', 6000.00),
(7, '2025-01-15', 'VIGENTE', 'Administración de sistemas informáticos', '2025-01-18', '2026-01-17', 7000.00),
(8, '2025-01-18', 'VIGENTE', 'Dirección administrativa general', '2025-01-20', '2026-01-19', 9000.00);

CREATE TABLE `detalle_compra` (
  `id_detalle` int(11) NOT NULL,
  `fecha_compra` date DEFAULT NULL,
  `costo_adquisicion` decimal(10,2) DEFAULT NULL,
  `proveedor` varchar(150) DEFAULT NULL,
  `numero_factura` varchar(150) DEFAULT NULL,
  `fecha_vencimiento_garantia` date DEFAULT NULL,
  `garantia` varchar(150) DEFAULT NULL,
  `id_equipamiento` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `detalle_compra` (`id_detalle`, `fecha_compra`, `costo_adquisicion`, `proveedor`, `numero_factura`, `fecha_vencimiento_garantia`, `garantia`, `id_equipamiento`) VALUES
(1, '2026-07-01', 2450.00, NULL, NULL, NULL, NULL, NULL);

CREATE TABLE `detalle_compra_producto` (
  `id_detalle_p` int(11) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `costo` decimal(10,2) DEFAULT NULL,
  `proveedor` varchar(150) DEFAULT NULL,
  `fecha_compra` date DEFAULT NULL,
  `id_producto` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `detalle_compra_producto` (`id_detalle_p`, `cantidad`, `costo`, `proveedor`, `fecha_compra`, `id_producto`) VALUES
(1, 30.00, 35.00, NULL, NULL, NULL),
(2, 40.00, 18.00, NULL, NULL, NULL);

CREATE TABLE `dispone_de` (
  `id_area` int(11) NOT NULL,
  `id_equipamiento` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `empleado` (
  `id_empleado` int(11) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `apellidos` varchar(80) NOT NULL,
  `ci` varchar(20) NOT NULL,
  `sexo` enum('M','F','OTRO') DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `estado_civil` varchar(30) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `estado` varchar(100) DEFAULT NULL,
  `idioma` varchar(150) DEFAULT NULL,
  `correo_electronico` varchar(510) DEFAULT NULL,
  `contrasenia` varchar(200) DEFAULT NULL,
  `numero_puerta` int(11) DEFAULT NULL,
  `calle` varchar(100) DEFAULT NULL,
  `ciudad` varchar(150) DEFAULT NULL,
  `id_ambiente` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `empleado` (`id_empleado`, `nombre`, `apellidos`, `ci`, `sexo`, `fecha_nacimiento`, `estado_civil`, `telefono`, `estado`, `idioma`, `correo_electronico`, `contrasenia`, `numero_puerta`, `calle`, `ciudad`, `id_ambiente`) VALUES
(1, 'Marcelo', 'Rojas Quispe', '5541223', 'M', '1985-03-12', 'Casado', '70011122', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'Andrea', 'Fernández Paz', '6782341', 'F', '1990-07-22', 'Soltera', '71122334', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'Luis', 'Mamani Choque', '4498212', 'M', '1988-11-02', 'Soltero', '72233445', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'Carla', 'Vargas Soliz', '7891234', 'F', '1993-05-30', 'Casada', '73344556', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'Jorge', 'Quiroga Terán', '3321987', 'M', '1979-09-15', 'Casado', '74455667', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'Carlos', 'Mamani Quispe', '9134567 LP', 'M', '1988-05-14', 'Casado', '71234561', 'Activo', 'Español, Aymara', 'carlos.mamani@loscilindros.com', 'Carlos@2026', 145, 'Av. Arce', 'La Paz', 1),
(7, 'María', 'Condori Choque', '8456789 LP', 'F', '1993-11-02', 'Soltera', '71234562', 'Activo', 'Español', 'maria.condori@loscilindros.com', 'Maria@2026', 220, 'Calle Yanacocha', 'La Paz', 2),
(8, 'José', 'Flores Rojas', '7365124 LP', 'M', '1985-02-21', 'Casado', '71234563', 'Activo', 'Español, Inglés', 'jose.flores@loscilindros.com', 'Jose@2026', 78, 'Av. Busch', 'La Paz', 3),
(9, 'Lucía', 'Vargas Pérez', '6543217 LP', 'F', '1996-08-17', 'Soltera', '71234564', 'Vacaciones', 'Español', 'lucia.vargas@loscilindros.com', 'Lucia@2026', 412, 'Av. 6 de Agosto', 'La Paz', 4),
(10, 'Miguel', 'Apaza Ticona', '5987412 LP', 'M', '1990-12-09', 'Casado', '71234565', 'Activo', 'Español, Quechua', 'miguel.apaza@loscilindros.com', 'Miguel@2026', 91, 'Av. Camacho', 'La Paz', 5),
(11, 'Ana', 'Gutiérrez Mendoza', '7821459 LP', 'F', '1998-04-05', 'Soltera', '71234566', 'Activo', 'Español', 'ana.gutierrez@loscilindros.com', 'Ana@2026', 53, 'Av. Montes', 'La Paz', 6),
(12, 'Fernando', 'Sánchez López', '8697541 LP', 'M', '1987-10-30', 'Divorciado', '71234567', 'Licencia Médica', 'Español', 'fernando.sanchez@loscilindros.com', 'Fernando@2026', 167, 'Av. Mariscal Santa Cruz', 'La Paz', 7),
(13, 'Patricia', 'Mendoza Cruz', '9345876 LP', 'F', '1994-06-12', 'Casada', '71234568', 'Activo', 'Español, Inglés', 'patricia.mendoza@loscilindros.com', 'Patricia@2026', 305, 'Calle Potosí', 'La Paz', 8);

CREATE TABLE `equipamiento` (
  `id_equipamiento` int(11) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `modelo` varchar(60) DEFAULT NULL,
  `marca` varchar(60) DEFAULT NULL,
  `fabricante` varchar(60) DEFAULT NULL,
  `tipo` varchar(150) DEFAULT NULL,
  `numero_serie` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `equipamiento` (`id_equipamiento`, `nombre`, `modelo`, `marca`, `fabricante`, `tipo`, `numero_serie`) VALUES
(1, 'Horno industrial', 'HX-200', 'RationalTech', 'Rational GmbH', NULL, NULL),
(2, 'Cámara de frío', 'CF-500', 'FrioMax', 'FrioMax Bolivia', NULL, NULL),
(3, 'Parrilla a gas', 'PG-100', 'GrillPro', 'GrillPro SA', NULL, NULL);

CREATE TABLE `factura` (
  `id_factura` int(11) NOT NULL,
  `nit` varchar(50) DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `fecha_emision` date DEFAULT NULL,
  `id_pedido` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `log_acceso` (
  `id_log` int(11) NOT NULL,
  `fecha` date DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `ip` varchar(145) DEFAULT NULL,
  `tipo_acceso` varchar(150) DEFAULT NULL,
  `id_empleado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `mantiene` (
  `id_mantenimiento` int(11) NOT NULL,
  `id_empleado` int(11) DEFAULT NULL,
  `id_equipamiento` int(11) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `motivo` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `mesa` (
  `id_mesa` int(11) NOT NULL,
  `id_ambiente` int(11) NOT NULL,
  `capacidad_maxima` int(11) NOT NULL,
  `estado` enum('DISPONIBLE','OCUPADA','RESERVADA','INACTIVA') NOT NULL DEFAULT 'DISPONIBLE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `mesa` (`id_mesa`, `id_ambiente`, `capacidad_maxima`, `estado`) VALUES
(1, 1, 2, 'DISPONIBLE'),
(2, 1, 4, 'DISPONIBLE'),
(3, 1, 4, 'DISPONIBLE'),
(4, 1, 6, 'DISPONIBLE'),
(5, 2, 4, 'DISPONIBLE'),
(6, 2, 4, 'DISPONIBLE'),
(7, 3, 20, 'DISPONIBLE');

CREATE TABLE `pago_empleado` (
  `id_pago` int(11) NOT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  `monto` decimal(10,2) DEFAULT NULL,
  `fecha_pago` date DEFAULT NULL,
  `id_empleado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `pedido` (
  `id_pedido` int(11) NOT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `id_mesa` int(11) DEFAULT NULL,
  `id_cliente` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `pertenece` (
  `id_empleado` int(11) NOT NULL,
  `id_area` int(11) NOT NULL,
  `id_contrato` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `producto` (
  `id_producto` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `categoria` varchar(60) NOT NULL,
  `unidad_de_medida` varchar(30) DEFAULT NULL,
  `marca` varchar(150) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `id_almacen` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `producto` (`id_producto`, `nombre`, `categoria`, `unidad_de_medida`, `marca`, `stock`, `fecha_vencimiento`, `id_almacen`) VALUES
(1, 'Sopa de Maní', 'Entrada', 'porción', NULL, NULL, NULL, NULL),
(2, 'Empanadas Salteñas', 'Entrada', 'porción', NULL, NULL, NULL, NULL),
(3, 'Ensalada de Quinua', 'Entrada', 'porción', NULL, NULL, NULL, NULL),
(4, 'Choclo con Queso', 'Entrada', 'porción', NULL, NULL, NULL, NULL),
(5, 'Picante de Pollo', 'Plato Fuerte', 'porción', NULL, NULL, NULL, NULL),
(6, 'Parrillada El Fogón', 'Plato Fuerte', 'porción', NULL, NULL, NULL, NULL),
(7, 'Silpancho El Fogón', 'Plato Fuerte', 'porción', NULL, NULL, NULL, NULL),
(8, 'Trucha a la Plancha', 'Plato Fuerte', 'porción', NULL, NULL, NULL, NULL),
(9, 'Lomo Montado', 'Plato Fuerte', 'porción', NULL, NULL, NULL, NULL),
(10, 'Pique Macho para Compartir', 'Plato Fuerte', 'porción', NULL, NULL, NULL, NULL),
(11, 'Tiramisú de la Casa', 'Postre', 'porción', NULL, NULL, NULL, NULL),
(12, 'Helado Artesanal', 'Postre', 'porción', NULL, NULL, NULL, NULL),
(13, 'Keke de Chocolate', 'Postre', 'porción', NULL, NULL, NULL, NULL),
(14, 'Limonada de Coco', 'Bebida', 'vaso', NULL, NULL, NULL, NULL),
(15, 'Jugo de Temporada', 'Bebida', 'vaso', NULL, NULL, NULL, NULL),
(16, 'Cerveza Artesanal El Fogón', 'Bebida', 'pinta', NULL, NULL, NULL, NULL),
(17, 'Copa de Vino de la Casa', 'Bebida', 'copa', NULL, NULL, NULL, NULL),
(18, 'Pan de la Casa', 'Adicional', 'porción', NULL, NULL, NULL, NULL),
(19, 'Papas Fritas El Fogón', 'Adicional', 'porción', NULL, NULL, NULL, NULL);

CREATE TABLE `producto_emplatado` (
  `id_producto_emplatado` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT NULL,
  `id_carta` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `registro_cargo` (
  `id_registro` int(11) NOT NULL,
  `id_empleado` int(11) NOT NULL,
  `tipo_cargo_actual` varchar(150) NOT NULL,
  `fecha` date NOT NULL,
  `motivo` varchar(190) DEFAULT NULL,
  `tipo_cargo_anterior` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `registro_cargo` (`id_registro`, `id_empleado`, `tipo_cargo_actual`, `fecha`, `motivo`, `tipo_cargo_anterior`) VALUES
(1, 1, 'Administrador General', '2025-01-08', 'Ingreso al restaurante', NULL),
(2, 2, 'Administrador Financiero', '2025-01-08', 'Ingreso al restaurante', NULL),
(3, 3, 'Jefe de Recursos Humanos', '2025-01-10', 'Ingreso al restaurante', NULL),
(4, 4, 'Administrador de Sistemas', '2025-01-20', 'Ingreso al restaurante', NULL);

CREATE TABLE `reserva` (
  `id_reserva` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_mesa` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `cantidad_personas` int(11) NOT NULL,
  `estado` enum('PENDIENTE','CONFIRMADA','CANCELADA','COMPLETADA') NOT NULL DEFAULT 'PENDIENTE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `solicita` (
  `id_ambiente` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `estado` varchar(50) NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `cantidad_persona` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `utiliza` (
  `id_cocina` int(11) NOT NULL,
  `id_equipamiento` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `administrador`
  ADD PRIMARY KEY (`id_administrador`),
  ADD UNIQUE KEY `id_empleado` (`id_empleado`);
ALTER TABLE `almacen`
  ADD PRIMARY KEY (`id_almacen`),
  ADD KEY `id_responsable` (`id_responsable`);
ALTER TABLE `ambiente`
  ADD PRIMARY KEY (`id_ambiente`);
ALTER TABLE `area`
  ADD PRIMARY KEY (`id_area`),
  ADD KEY `id_responsable` (`id_responsable`);
ALTER TABLE `asistencia`
  ADD PRIMARY KEY (`id_asistencia`),
  ADD KEY `id_empleado` (`id_empleado`);
ALTER TABLE `carta`
  ADD PRIMARY KEY (`id_carta`);
ALTER TABLE `certificacion`
  ADD PRIMARY KEY (`id_certificacion`),
  ADD KEY `id_cocinero` (`id_cocinero`);
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `ci` (`ci`),
  ADD UNIQUE KEY `correo` (`correo`);
ALTER TABLE `cocina`
  ADD PRIMARY KEY (`id_cocina`),
  ADD KEY `id_area` (`id_area`),
  ADD KEY `fk_cocina` (`id_responsable`);
ALTER TABLE `cocinero`
  ADD PRIMARY KEY (`id_cocinero`),
  ADD UNIQUE KEY `id_empleado` (`id_empleado`);
ALTER TABLE `conforma`
  ADD PRIMARY KEY (`id_cocinero`,`id_cocina`,`id_contrato`),
  ADD KEY `id_cocina` (`id_cocina`),
  ADD KEY `id_contrato` (`id_contrato`);
ALTER TABLE `contrato`
  ADD PRIMARY KEY (`id_contrato`);
ALTER TABLE `detalle_compra`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `fk_compra` (`id_equipamiento`);
ALTER TABLE `detalle_compra_producto`
  ADD PRIMARY KEY (`id_detalle_p`),
  ADD KEY `fk_compra_producto` (`id_producto`);
ALTER TABLE `dispone_de`
  ADD PRIMARY KEY (`id_area`,`id_equipamiento`),
  ADD KEY `id_equipamiento` (`id_equipamiento`);
ALTER TABLE `empleado`
  ADD PRIMARY KEY (`id_empleado`),
  ADD UNIQUE KEY `ci` (`ci`),
  ADD KEY `fk_id_ambiente` (`id_ambiente`);
ALTER TABLE `equipamiento`
  ADD PRIMARY KEY (`id_equipamiento`);
ALTER TABLE `factura`
  ADD PRIMARY KEY (`id_factura`),
  ADD KEY `id_pedido` (`id_pedido`);
ALTER TABLE `log_acceso`
  ADD PRIMARY KEY (`id_log`),
  ADD KEY `id_empleado` (`id_empleado`);
ALTER TABLE `mantiene`
  ADD PRIMARY KEY (`id_mantenimiento`),
  ADD KEY `id_empleado` (`id_empleado`),
  ADD KEY `id_equipamiento` (`id_equipamiento`);
ALTER TABLE `mesa`
  ADD PRIMARY KEY (`id_mesa`),
  ADD KEY `idx_mesa_ambiente` (`id_ambiente`);
ALTER TABLE `pago_empleado`
  ADD PRIMARY KEY (`id_pago`),
  ADD KEY `id_empleado` (`id_empleado`);
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id_pedido`),
  ADD KEY `id_mesa` (`id_mesa`),
  ADD KEY `id_cliente` (`id_cliente`);
ALTER TABLE `pertenece`
  ADD PRIMARY KEY (`id_empleado`,`id_area`,`id_contrato`),
  ADD KEY `id_area` (`id_area`),
  ADD KEY `id_contrato` (`id_contrato`);
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `fk_producto` (`id_almacen`);
ALTER TABLE `producto_emplatado`
  ADD PRIMARY KEY (`id_producto_emplatado`),
  ADD KEY `id_carta` (`id_carta`);
ALTER TABLE `registro_cargo`
  ADD PRIMARY KEY (`id_registro`),
  ADD KEY `id_empleado` (`id_empleado`);
ALTER TABLE `reserva`
  ADD PRIMARY KEY (`id_reserva`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_mesa` (`id_mesa`),
  ADD KEY `idx_reserva_fecha` (`fecha`);
ALTER TABLE `solicita`
  ADD PRIMARY KEY (`id_ambiente`,`id_cliente`,`fecha`),
  ADD KEY `fk_cliente` (`id_cliente`);
ALTER TABLE `utiliza`
  ADD PRIMARY KEY (`id_cocina`,`id_equipamiento`),
  ADD KEY `id_equipamiento` (`id_equipamiento`);

ALTER TABLE `administrador` MODIFY `id_administrador` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `almacen` MODIFY `id_almacen` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `ambiente` MODIFY `id_ambiente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
ALTER TABLE `area` MODIFY `id_area` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
ALTER TABLE `asistencia` MODIFY `id_asistencia` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `carta` MODIFY `id_carta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
ALTER TABLE `certificacion` MODIFY `id_certificacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
ALTER TABLE `cliente` MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
ALTER TABLE `cocina` MODIFY `id_cocina` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `cocinero` MODIFY `id_cocinero` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
ALTER TABLE `contrato` MODIFY `id_contrato` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
ALTER TABLE `detalle_compra` MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `detalle_compra_producto` MODIFY `id_detalle_p` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
ALTER TABLE `empleado` MODIFY `id_empleado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
ALTER TABLE `equipamiento` MODIFY `id_equipamiento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
ALTER TABLE `factura` MODIFY `id_factura` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `log_acceso` MODIFY `id_log` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `mantiene` MODIFY `id_mantenimiento` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `mesa` MODIFY `id_mesa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
ALTER TABLE `pago_empleado` MODIFY `id_pago` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `pedido` MODIFY `id_pedido` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `producto` MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;
ALTER TABLE `producto_emplatado` MODIFY `id_producto_emplatado` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `registro_cargo` MODIFY `id_registro` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
ALTER TABLE `reserva` MODIFY `id_reserva` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `administrador` ADD CONSTRAINT `administrador_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`);
ALTER TABLE `almacen` ADD CONSTRAINT `almacen_ibfk_1` FOREIGN KEY (`id_responsable`) REFERENCES `empleado` (`id_empleado`);
ALTER TABLE `area` ADD CONSTRAINT `area_ibfk_1` FOREIGN KEY (`id_responsable`) REFERENCES `empleado` (`id_empleado`);
ALTER TABLE `asistencia` ADD CONSTRAINT `asistencia_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`);
ALTER TABLE `certificacion` ADD CONSTRAINT `certificacion_ibfk_1` FOREIGN KEY (`id_cocinero`) REFERENCES `cocinero` (`id_cocinero`);
ALTER TABLE `cocina` ADD CONSTRAINT `cocina_ibfk_1` FOREIGN KEY (`id_area`) REFERENCES `area` (`id_area`), ADD CONSTRAINT `fk_cocina` FOREIGN KEY (`id_responsable`) REFERENCES `cocinero` (`id_cocinero`);
ALTER TABLE `cocinero` ADD CONSTRAINT `cocinero_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`);
ALTER TABLE `conforma` ADD CONSTRAINT `conforma_ibfk_1` FOREIGN KEY (`id_cocinero`) REFERENCES `cocinero` (`id_cocinero`), ADD CONSTRAINT `conforma_ibfk_2` FOREIGN KEY (`id_cocina`) REFERENCES `cocina` (`id_cocina`), ADD CONSTRAINT `conforma_ibfk_3` FOREIGN KEY (`id_contrato`) REFERENCES `contrato` (`id_contrato`);
ALTER TABLE `detalle_compra` ADD CONSTRAINT `fk_compra` FOREIGN KEY (`id_equipamiento`) REFERENCES `equipamiento` (`id_equipamiento`);
ALTER TABLE `detalle_compra_producto` ADD CONSTRAINT `fk_compra_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`);
ALTER TABLE `dispone_de` ADD CONSTRAINT `dispone_de_ibfk_1` FOREIGN KEY (`id_area`) REFERENCES `area` (`id_area`), ADD CONSTRAINT `dispone_de_ibfk_2` FOREIGN KEY (`id_equipamiento`) REFERENCES `equipamiento` (`id_equipamiento`);
ALTER TABLE `empleado` ADD CONSTRAINT `fk_id_ambiente` FOREIGN KEY (`id_ambiente`) REFERENCES `ambiente` (`id_ambiente`);
ALTER TABLE `factura` ADD CONSTRAINT `factura_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`);
ALTER TABLE `log_acceso` ADD CONSTRAINT `log_acceso_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`);
ALTER TABLE `mantiene` ADD CONSTRAINT `mantiene_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`), ADD CONSTRAINT `mantiene_ibfk_2` FOREIGN KEY (`id_equipamiento`) REFERENCES `equipamiento` (`id_equipamiento`);
ALTER TABLE `mesa` ADD CONSTRAINT `mesa_ibfk_1` FOREIGN KEY (`id_ambiente`) REFERENCES `ambiente` (`id_ambiente`);
ALTER TABLE `pago_empleado` ADD CONSTRAINT `pago_empleado_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`);
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`id_mesa`) REFERENCES `mesa` (`id_mesa`), ADD CONSTRAINT `pedido_ibfk_2` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`);
ALTER TABLE `pertenece` ADD CONSTRAINT `pertenece_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`), ADD CONSTRAINT `pertenece_ibfk_2` FOREIGN KEY (`id_area`) REFERENCES `area` (`id_area`), ADD CONSTRAINT `pertenece_ibfk_3` FOREIGN KEY (`id_contrato`) REFERENCES `contrato` (`id_contrato`);
ALTER TABLE `producto` ADD CONSTRAINT `fk_producto` FOREIGN KEY (`id_almacen`) REFERENCES `almacen` (`id_almacen`);
ALTER TABLE `producto_emplatado` ADD CONSTRAINT `producto_emplatado_ibfk_1` FOREIGN KEY (`id_carta`) REFERENCES `carta` (`id_carta`);
ALTER TABLE `registro_cargo` ADD CONSTRAINT `registro_cargo_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`);
ALTER TABLE `reserva` ADD CONSTRAINT `reserva_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`), ADD CONSTRAINT `reserva_ibfk_2` FOREIGN KEY (`id_mesa`) REFERENCES `mesa` (`id_mesa`);
ALTER TABLE `solicita` ADD CONSTRAINT `fk_ambiente` FOREIGN KEY (`id_ambiente`) REFERENCES `ambiente` (`id_ambiente`), ADD CONSTRAINT `fk_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`);
ALTER TABLE `utiliza` ADD CONSTRAINT `utiliza_ibfk_1` FOREIGN KEY (`id_cocina`) REFERENCES `cocina` (`id_cocina`), ADD CONSTRAINT `utiliza_ibfk_2` FOREIGN KEY (`id_equipamiento`) REFERENCES `equipamiento` (`id_equipamiento`);
COMMIT;

-- =====================================================================
-- EXTENSIONES ADITIVAS para las funcionalidades pedidas por el cliente
-- (login con Google, recuperar contraseña). No se toca ni se renombra
-- ninguna columna/tabla ya existente en el dump del equipo.
-- =====================================================================

ALTER TABLE `cliente`
  ADD COLUMN `activo` TINYINT(1) NOT NULL DEFAULT 1 AFTER `contrasenia`,
  ADD COLUMN `google_id` VARCHAR(255) NULL UNIQUE AFTER `activo`,
  ADD COLUMN `proveedor` ENUM('LOCAL','GOOGLE') NOT NULL DEFAULT 'LOCAL' AFTER `google_id`;

-- Tokens de "olvidé mi contraseña". Sirve tanto para cliente como para
-- empleado (cada uno guarda su propia contraseña en su propia tabla),
-- por eso se identifica la cuenta con (tipo_cuenta, id_cuenta) en vez de
-- una FK única. Se guarda el HASH del token, nunca el token en claro.
CREATE TABLE `recuperacion_password` (
  `id_recuperacion` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `tipo_cuenta` ENUM('CLIENTE','EMPLEADO') NOT NULL,
  `id_cuenta` int(11) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `fecha_expiracion` datetime NOT NULL,
  `usado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_recuperacion_cuenta` (`tipo_cuenta`, `id_cuenta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Para poder mostrar la carta de platos (producto_emplatado) y los ambientes
-- con foto + categoría/disponibilidad en la web pública.
ALTER TABLE `producto_emplatado`
  ADD COLUMN `categoria` VARCHAR(60) NULL AFTER `descripcion`,
  ADD COLUMN `imagen_url` VARCHAR(500) NULL AFTER `costo`,
  ADD COLUMN `estado` TINYINT(1) NOT NULL DEFAULT 1 AFTER `imagen_url`;

ALTER TABLE `ambiente`
  ADD COLUMN `imagen_url` VARCHAR(500) NULL AFTER `capacidad`;

-- Carga inicial de platos (antes vivían en `producto`, que ahora es
-- inventario de insumos). Se listan bajo la carta 1.
INSERT INTO `producto_emplatado` (`nombre`, `descripcion`, `categoria`, `costo`, `imagen_url`, `estado`, `id_carta`) VALUES
('Sopa de Maní', 'Clásica sopa boliviana con maní y carne de res', 'Entrada', 28.00, 'https://images.unsplash.com/photo-1665594051407-7385d281ad76?auto=format&fit=crop&q=80&w=800', 1, 1),
('Empanadas Salteñas', 'Trío de empanadas jugosas horneadas al momento', 'Entrada', 22.00, 'https://images.unsplash.com/photo-1548228586-171fb0887ac0?auto=format&fit=crop&q=80&w=800', 1, 1),
('Ensalada de Quinua', 'Quinua real, palta, tomate cherry y vinagreta de limón', 'Entrada', 26.00, NULL, 1, 1),
('Picante de Pollo', 'Pollo en salsa picante con papa y arroz', 'Plato Fuerte', 55.00, 'https://images.unsplash.com/photo-1708782344490-9026aaa5eec7?auto=format&fit=crop&q=80&w=800', 1, 1),
('Parrillada El Fogón', 'Selección de carnes a la parrilla para compartir', 'Plato Fuerte', 120.00, 'https://images.unsplash.com/photo-1774668748614-f188f5b61535?auto=format&fit=crop&q=80&w=800', 1, 1),
('Silpancho El Fogón', 'Carne apanada sobre arroz, papa y huevo frito', 'Plato Fuerte', 58.00, 'https://images.unsplash.com/photo-1543900348-f03d06be7653?auto=format&fit=crop&q=80&w=800', 1, 1),
('Tiramisú de la Casa', 'Postre italiano con receta propia', 'Postre', 24.00, 'https://images.unsplash.com/photo-1746888151121-1002113ed286?auto=format&fit=crop&q=80&w=800', 1, 2),
('Limonada de Coco', 'Bebida refrescante artesanal', 'Bebida', 16.00, 'https://images.unsplash.com/photo-1754594537133-796eb54f206c?auto=format&fit=crop&q=80&w=800', 1, 2);

UPDATE `ambiente` SET imagen_url = 'https://images.unsplash.com/photo-1701722952679-beffce26d77a?auto=format&fit=crop&q=80&w=1000' WHERE id_ambiente = 1;
UPDATE `ambiente` SET imagen_url = 'https://images.unsplash.com/photo-1756680967373-c3205a8a8b31?auto=format&fit=crop&q=80&w=1000' WHERE id_ambiente = 2;
UPDATE `ambiente` SET imagen_url = 'https://images.unsplash.com/photo-1762765685319-fdaf8d22085d?auto=format&fit=crop&q=80&w=1000' WHERE id_ambiente = 3;

-- Área "Caja" para poder probar el rol 'caja' con un empleado real (Jorge,
-- id_empleado 5). El rol de un empleado se deduce de qué área tiene a su
-- cargo (ver obtenerRolEmpleado en authController.js).
INSERT INTO `area` (`nombre`, `capacidad_personal`, `id_responsable`, `objetivo`) VALUES
('Caja', 2, 5, 'Cobros y facturación en el punto de venta');

-- ===================== FUNCIONES =====================
DELIMITER $$
CREATE FUNCTION `fn_calcular_edad`(p_fecha_nacimiento DATE)
RETURNS INT
DETERMINISTIC
BEGIN
    IF p_fecha_nacimiento IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN TIMESTAMPDIFF(YEAR, p_fecha_nacimiento, CURDATE());
END$$
DELIMITER ;

DELIMITER $$
CREATE FUNCTION `fn_total_pedidos_cliente`(p_id_cliente INT)
RETURNS DECIMAL(10,2)
READS SQL DATA
BEGIN
    DECLARE v_total DECIMAL(10,2);
    SELECT COALESCE(SUM(total), 0) INTO v_total
      FROM `pedido`
     WHERE id_cliente = p_id_cliente;
    RETURN v_total;
END$$
DELIMITER ;

DELIMITER $$
CREATE FUNCTION `fn_mesas_disponibles_ambiente`(p_id_ambiente INT)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_cantidad INT;
    SELECT COUNT(*) INTO v_cantidad
      FROM `mesa`
     WHERE id_ambiente = p_id_ambiente
       AND estado = 'DISPONIBLE';
    RETURN v_cantidad;
END$$
DELIMITER ;

DELIMITER $$
CREATE FUNCTION `fn_dias_para_vencer_contrato`(p_id_contrato INT)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_fecha_fin DATE;
    SELECT fecha_fin INTO v_fecha_fin
      FROM `contrato`
     WHERE id_contrato = p_id_contrato;
    IF v_fecha_fin IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN DATEDIFF(v_fecha_fin, CURDATE());
END$$
DELIMITER ;

DELIMITER $$
CREATE FUNCTION `fn_nombre_completo_empleado`(p_id_empleado INT)
RETURNS VARCHAR(170)
READS SQL DATA
BEGIN
    DECLARE v_nombre_completo VARCHAR(170);
    SELECT CONCAT(nombre, ' ', apellidos) INTO v_nombre_completo
      FROM `empleado`
     WHERE id_empleado = p_id_empleado;
    RETURN v_nombre_completo;
END$$
DELIMITER ;

DELIMITER $$
CREATE FUNCTION `fn_stock_total_almacen`(p_id_almacen INT)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_stock_total INT;
    SELECT COALESCE(SUM(stock), 0) INTO v_stock_total
      FROM `producto`
     WHERE id_almacen = p_id_almacen;
    RETURN v_stock_total;
END$$
DELIMITER ;

DELIMITER $$
CREATE FUNCTION `fn_certificacion_vigente`(p_id_certificacion INT)
RETURNS TINYINT(1)
READS SQL DATA
BEGIN
    DECLARE v_fecha_expiracion DATE;
    SELECT fecha_expiracion INTO v_fecha_expiracion
      FROM `certificacion`
     WHERE id_certificacion = p_id_certificacion;
    IF v_fecha_expiracion IS NULL THEN
        RETURN 1;
    END IF;
    RETURN v_fecha_expiracion >= CURDATE();
END$$
DELIMITER ;

-- ===================== PROCEDIMIENTOS =====================
DELIMITER $$
CREATE PROCEDURE `sp_insertar_cliente`(
    IN p_nombre VARCHAR(80), IN p_apellidos VARCHAR(80), IN p_ci VARCHAR(20),
    IN p_telefono VARCHAR(20), IN p_correo VARCHAR(120)
)
BEGIN
    INSERT INTO `cliente` (nombre, apellidos, ci, telefono, correo)
    VALUES (p_nombre, p_apellidos, p_ci, p_telefono, p_correo);
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_actualizar_estado_mesa`(
    IN p_id_mesa INT, IN p_nuevo_estado ENUM('DISPONIBLE','OCUPADA','RESERVADA','INACTIVA')
)
BEGIN
    UPDATE `mesa` SET estado = p_nuevo_estado WHERE id_mesa = p_id_mesa;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_listar_reservas_pendientes`(IN p_desde DATE)
BEGIN
    SELECT r.id_reserva, c.nombre, c.apellidos, r.fecha, r.cantidad_personas, m.id_mesa
      FROM `reserva` r
      JOIN `cliente` c ON c.id_cliente = r.id_cliente
      JOIN `mesa` m ON m.id_mesa = r.id_mesa
     WHERE r.estado = 'PENDIENTE' AND r.fecha >= p_desde
     ORDER BY r.fecha;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_reporte_ventas_por_fecha`(IN p_fecha DATE)
BEGIN
    SELECT COUNT(*) AS cantidad_pedidos, COALESCE(SUM(total), 0) AS total_vendido
      FROM `pedido` WHERE fecha = p_fecha;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_actualizar_stock_producto`(
    IN p_id_producto INT, IN p_cantidad INT, IN p_tipo_movimiento ENUM('ENTRADA','SALIDA')
)
BEGIN
    IF p_tipo_movimiento = 'ENTRADA' THEN
        UPDATE `producto` SET stock = COALESCE(stock, 0) + p_cantidad WHERE id_producto = p_id_producto;
    ELSE
        UPDATE `producto` SET stock = COALESCE(stock, 0) - p_cantidad WHERE id_producto = p_id_producto;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_buscar_empleados_por_ambiente`(IN p_id_ambiente INT)
BEGIN
    SELECT id_empleado, nombre, apellidos, telefono, correo_electronico
      FROM `empleado`
     WHERE id_ambiente = p_id_ambiente AND (estado = 'Activo' OR estado IS NULL);
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_registrar_asistencia_ingreso`(IN p_id_empleado INT)
BEGIN
    INSERT INTO `asistencia` (id_empleado, fecha, hora_ingreso)
    VALUES (p_id_empleado, CURDATE(), CURTIME());
END$$
DELIMITER ;

-- ===================== TRANSACCIONES =====================
DELIMITER $$
CREATE PROCEDURE `sp_tx_registrar_pedido`(IN p_id_mesa INT, IN p_id_cliente INT, OUT p_id_pedido INT)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
    START TRANSACTION;
    INSERT INTO `pedido` (total, estado, fecha, id_mesa, id_cliente)
    VALUES (0.00, 'PENDIENTE', CURDATE(), p_id_mesa, p_id_cliente);
    SET p_id_pedido = LAST_INSERT_ID();
    UPDATE `mesa` SET estado = 'OCUPADA' WHERE id_mesa = p_id_mesa;
    COMMIT;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_tx_confirmar_reserva`(IN p_id_reserva INT)
BEGIN
    DECLARE v_id_mesa INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
    START TRANSACTION;
    SELECT id_mesa INTO v_id_mesa FROM `reserva` WHERE id_reserva = p_id_reserva FOR UPDATE;
    UPDATE `reserva` SET estado = 'CONFIRMADA' WHERE id_reserva = p_id_reserva;
    UPDATE `mesa` SET estado = 'RESERVADA' WHERE id_mesa = v_id_mesa;
    COMMIT;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_tx_registrar_pago_empleado`(
    IN p_id_empleado INT, IN p_monto DECIMAL(10,2), IN p_observaciones VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
    START TRANSACTION;
    IF p_monto <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El monto del pago debe ser mayor a cero';
    END IF;
    INSERT INTO `pago_empleado` (observaciones, monto, fecha_pago, id_empleado)
    VALUES (p_observaciones, p_monto, CURDATE(), p_id_empleado);
    COMMIT;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_tx_baja_logica_empleado`(IN p_id_empleado INT, IN p_motivo VARCHAR(190))
BEGIN
    DECLARE v_cargo_actual VARCHAR(150);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
    START TRANSACTION;
    SELECT tipo_cargo_actual INTO v_cargo_actual
      FROM `registro_cargo` WHERE id_empleado = p_id_empleado ORDER BY fecha DESC LIMIT 1;
    UPDATE `empleado` SET estado = 'Inactivo' WHERE id_empleado = p_id_empleado;
    INSERT INTO `registro_cargo` (id_empleado, tipo_cargo_actual, fecha, motivo, tipo_cargo_anterior)
    VALUES (p_id_empleado, 'Baja', CURDATE(), p_motivo, v_cargo_actual);
    COMMIT;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_tx_registrar_compra_equipamiento`(
    IN p_nombre VARCHAR(80), IN p_modelo VARCHAR(60), IN p_marca VARCHAR(60),
    IN p_costo DECIMAL(10,2), IN p_proveedor VARCHAR(150)
)
BEGIN
    DECLARE v_id_equipamiento INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
    START TRANSACTION;
    INSERT INTO `equipamiento` (nombre, modelo, marca) VALUES (p_nombre, p_modelo, p_marca);
    SET v_id_equipamiento = LAST_INSERT_ID();
    INSERT INTO `detalle_compra` (fecha_compra, costo_adquisicion, proveedor, id_equipamiento)
    VALUES (CURDATE(), p_costo, p_proveedor, v_id_equipamiento);
    COMMIT;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_tx_cancelar_reserva`(IN p_id_reserva INT)
BEGIN
    DECLARE v_id_mesa INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
    START TRANSACTION;
    SELECT id_mesa INTO v_id_mesa FROM `reserva` WHERE id_reserva = p_id_reserva FOR UPDATE;
    UPDATE `reserva` SET estado = 'CANCELADA' WHERE id_reserva = p_id_reserva;
    UPDATE `mesa` SET estado = 'DISPONIBLE' WHERE id_mesa = v_id_mesa;
    COMMIT;
END$$
DELIMITER ;

-- ===================== CURSORES =====================
DELIMITER $$
CREATE PROCEDURE `sp_cur_empleados_por_area`(IN p_id_area INT)
BEGIN
    DECLARE v_fin INT DEFAULT 0;
    DECLARE v_id_empleado INT;
    DECLARE v_nombre VARCHAR(80);
    DECLARE v_apellidos VARCHAR(80);
    DECLARE cur_empleados CURSOR FOR
        SELECT e.id_empleado, e.nombre, e.apellidos
          FROM `empleado` e JOIN `pertenece` p ON p.id_empleado = e.id_empleado
         WHERE p.id_area = p_id_area;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_fin = 1;
    DROP TEMPORARY TABLE IF EXISTS tmp_empleados_area;
    CREATE TEMPORARY TABLE tmp_empleados_area (id_empleado INT, nombre_completo VARCHAR(170));
    OPEN cur_empleados;
    bucle_empleados: LOOP
        FETCH cur_empleados INTO v_id_empleado, v_nombre, v_apellidos;
        IF v_fin = 1 THEN LEAVE bucle_empleados; END IF;
        INSERT INTO tmp_empleados_area VALUES (v_id_empleado, CONCAT(v_nombre, ' ', v_apellidos));
    END LOOP;
    CLOSE cur_empleados;
    SELECT * FROM tmp_empleados_area;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_cur_productos_stock_bajo`(IN p_umbral INT)
BEGIN
    DECLARE v_fin INT DEFAULT 0;
    DECLARE v_id_producto INT;
    DECLARE v_nombre VARCHAR(100);
    DECLARE v_stock INT;
    DECLARE cur_productos CURSOR FOR
        SELECT id_producto, nombre, stock FROM `producto` WHERE stock IS NOT NULL AND stock < p_umbral;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_fin = 1;
    DROP TEMPORARY TABLE IF EXISTS tmp_stock_bajo;
    CREATE TEMPORARY TABLE tmp_stock_bajo (id_producto INT, nombre VARCHAR(100), stock INT, alerta VARCHAR(40));
    OPEN cur_productos;
    bucle_productos: LOOP
        FETCH cur_productos INTO v_id_producto, v_nombre, v_stock;
        IF v_fin = 1 THEN LEAVE bucle_productos; END IF;
        INSERT INTO tmp_stock_bajo VALUES (v_id_producto, v_nombre, v_stock, 'REABASTECER');
    END LOOP;
    CLOSE cur_productos;
    SELECT * FROM tmp_stock_bajo;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_cur_total_personas_reservas`(IN p_fecha DATE, OUT p_total INT)
BEGIN
    DECLARE v_fin INT DEFAULT 0;
    DECLARE v_cantidad INT;
    DECLARE cur_reservas CURSOR FOR
        SELECT cantidad_personas FROM `reserva` WHERE fecha = p_fecha AND estado <> 'CANCELADA';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_fin = 1;
    SET p_total = 0;
    OPEN cur_reservas;
    bucle_reservas: LOOP
        FETCH cur_reservas INTO v_cantidad;
        IF v_fin = 1 THEN LEAVE bucle_reservas; END IF;
        SET p_total = p_total + v_cantidad;
    END LOOP;
    CLOSE cur_reservas;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_cur_contratos_por_vencer`(IN p_dias INT)
BEGIN
    DECLARE v_fin INT DEFAULT 0;
    DECLARE v_id_contrato INT;
    DECLARE v_fecha_fin DATE;
    DECLARE v_objeto VARCHAR(150);
    DECLARE cur_contratos CURSOR FOR
        SELECT id_contrato, fecha_fin, objeto_contrato FROM `contrato`
         WHERE estado = 'VIGENTE' AND DATEDIFF(fecha_fin, CURDATE()) BETWEEN 0 AND p_dias;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_fin = 1;
    DROP TEMPORARY TABLE IF EXISTS tmp_contratos_vencer;
    CREATE TEMPORARY TABLE tmp_contratos_vencer (id_contrato INT, fecha_fin DATE, objeto_contrato VARCHAR(150), dias_restantes INT);
    OPEN cur_contratos;
    bucle_contratos: LOOP
        FETCH cur_contratos INTO v_id_contrato, v_fecha_fin, v_objeto;
        IF v_fin = 1 THEN LEAVE bucle_contratos; END IF;
        INSERT INTO tmp_contratos_vencer VALUES (v_id_contrato, v_fecha_fin, v_objeto, DATEDIFF(v_fecha_fin, CURDATE()));
    END LOOP;
    CLOSE cur_contratos;
    SELECT * FROM tmp_contratos_vencer ORDER BY dias_restantes;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_cur_actualizar_certificaciones_vencidas`()
BEGIN
    DECLARE v_fin INT DEFAULT 0;
    DECLARE v_id_certificacion INT;
    DECLARE cur_certificaciones CURSOR FOR
        SELECT id_certificacion FROM `certificacion`
         WHERE fecha_expiracion IS NOT NULL AND fecha_expiracion < CURDATE()
           AND (estado_vigencia IS NULL OR estado_vigencia <> 'VENCIDA');
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_fin = 1;
    OPEN cur_certificaciones;
    bucle_certificaciones: LOOP
        FETCH cur_certificaciones INTO v_id_certificacion;
        IF v_fin = 1 THEN LEAVE bucle_certificaciones; END IF;
        UPDATE `certificacion` SET estado_vigencia = 'VENCIDA' WHERE id_certificacion = v_id_certificacion;
    END LOOP;
    CLOSE cur_certificaciones;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_cur_capacidad_por_ambiente`()
BEGIN
    DECLARE v_fin INT DEFAULT 0;
    DECLARE v_id_ambiente INT;
    DECLARE v_nombre VARCHAR(80);
    DECLARE cur_ambientes CURSOR FOR SELECT id_ambiente, nombre FROM `ambiente`;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_fin = 1;
    DROP TEMPORARY TABLE IF EXISTS tmp_capacidad_ambiente;
    CREATE TEMPORARY TABLE tmp_capacidad_ambiente (id_ambiente INT, nombre VARCHAR(80), capacidad_total_mesas INT);
    OPEN cur_ambientes;
    bucle_ambientes: LOOP
        FETCH cur_ambientes INTO v_id_ambiente, v_nombre;
        IF v_fin = 1 THEN LEAVE bucle_ambientes; END IF;
        INSERT INTO tmp_capacidad_ambiente
        SELECT v_id_ambiente, v_nombre, COALESCE(SUM(capacidad_maxima), 0) FROM `mesa` WHERE id_ambiente = v_id_ambiente;
    END LOOP;
    CLOSE cur_ambientes;
    SELECT * FROM tmp_capacidad_ambiente;
END$$
DELIMITER ;

-- ===================== TRIGGERS =====================
DELIMITER $$
CREATE TRIGGER `trg_pedido_ocupa_mesa`
AFTER INSERT ON `pedido`
FOR EACH ROW
BEGIN
    IF NEW.id_mesa IS NOT NULL THEN
        UPDATE `mesa` SET `estado` = 'OCUPADA' WHERE `id_mesa` = NEW.id_mesa;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER `trg_pedido_libera_mesa`
AFTER UPDATE ON `pedido`
FOR EACH ROW
BEGIN
    IF NEW.estado = 'PAGADO' AND OLD.estado <> 'PAGADO' AND NEW.id_mesa IS NOT NULL THEN
        UPDATE `mesa` SET `estado` = 'DISPONIBLE' WHERE `id_mesa` = NEW.id_mesa;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER `trg_reserva_valida_capacidad`
BEFORE INSERT ON `reserva`
FOR EACH ROW
BEGIN
    DECLARE v_capacidad INT;
    SELECT `capacidad_maxima` INTO v_capacidad FROM `mesa` WHERE `id_mesa` = NEW.id_mesa;
    IF v_capacidad IS NOT NULL AND NEW.cantidad_personas > v_capacidad THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cantidad de personas excede la capacidad máxima de la mesa';
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER `trg_reserva_confirmada_marca_mesa`
AFTER UPDATE ON `reserva`
FOR EACH ROW
BEGIN
    IF NEW.estado = 'CONFIRMADA' AND OLD.estado <> 'CONFIRMADA' THEN
        UPDATE `mesa` SET `estado` = 'RESERVADA' WHERE `id_mesa` = NEW.id_mesa;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER `trg_reserva_cancelada_libera_mesa`
AFTER UPDATE ON `reserva`
FOR EACH ROW
BEGIN
    IF NEW.estado = 'CANCELADA' AND OLD.estado <> 'CANCELADA' THEN
        UPDATE `mesa` SET `estado` = 'DISPONIBLE' WHERE `id_mesa` = NEW.id_mesa;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER `trg_producto_stock_no_negativo`
BEFORE UPDATE ON `producto`
FOR EACH ROW
BEGIN
    IF NEW.stock IS NOT NULL AND NEW.stock < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El stock del producto no puede ser negativo';
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER `trg_empleado_prevenir_borrado_fisico`
BEFORE DELETE ON `empleado`
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No se permite eliminar empleados físicamente. Use UPDATE empleado SET estado = "Inactivo".';
END$$
DELIMITER ;
