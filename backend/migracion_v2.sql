-- =====================================================================
-- EL FOGÓN — Migración v2
-- Alinea la base de datos con lo que el backend ya esperaba pero el
-- schema.sql original nunca llegó a tener (por eso los 500 en
-- /productos, /ambientes-relacionados y partes de finanzas).
--
-- CÓMO USARLA:
--   - Instalación NUEVA: no hace falta, ya está todo integrado en
--     schema.sql (impórtalo y listo).
--   - Base de datos YA EXISTENTE (Railway / phpMyAdmin en producción):
--     ejecuta este archivo completo una sola vez sobre tu base actual.
--     Es aditivo: no borra ni renombra nada de lo que ya tenías.
-- =====================================================================
USE railway;
-- ---------------------------------------------------------------------
-- AMBIENTE: imagen para mostrar cada salón/terraza en el frontend.
-- ---------------------------------------------------------------------
ALTER TABLE `ambiente`
  ADD COLUMN `imagen_url` VARCHAR(500) NULL AFTER `capacidad`;

-- ---------------------------------------------------------------------
-- EMPLEADO: bandera simple de activo/inactivo (además del texto libre
-- que ya tenía en `estado`). GET /api/ambientes/empleados la necesita.
-- ---------------------------------------------------------------------
ALTER TABLE `empleado`
  ADD COLUMN `activo` TINYINT(1) NOT NULL DEFAULT 1 AFTER `estado`;

UPDATE `empleado` SET `activo` = 0 WHERE `estado` = 'Inactivo';

-- ---------------------------------------------------------------------
-- MESA: número visible para el público (m.numero se usaba ya en varias
-- consultas) y bandera activo/inactivo para ocultar mesas dadas de baja.
-- ---------------------------------------------------------------------
ALTER TABLE `mesa`
  ADD COLUMN `numero` INT(11) NULL AFTER `id_ambiente`,
  ADD COLUMN `activo` TINYINT(1) NOT NULL DEFAULT 1 AFTER `estado`;

UPDATE `mesa` SET `numero` = `id_mesa` WHERE `numero` IS NULL;

-- ---------------------------------------------------------------------
-- RESERVA: hora del turno, motivo opcional, baja lógica y expiración
-- automática de reservas PENDIENTE no confirmadas a tiempo.
-- ---------------------------------------------------------------------
ALTER TABLE `reserva`
  ADD COLUMN `hora` TIME NULL AFTER `fecha`,
  ADD COLUMN `motivo` VARCHAR(255) NULL AFTER `cantidad_personas`,
  ADD COLUMN `activo` TINYINT(1) NOT NULL DEFAULT 1 AFTER `estado`,
  ADD COLUMN `fecha_expiracion` DATETIME NULL AFTER `activo`;

UPDATE `reserva` SET `hora` = '12:00:00' WHERE `hora` IS NULL;

-- ---------------------------------------------------------------------
-- PRODUCTO_EMPLATADO: este es el "plato de carta" real (a diferencia de
-- PRODUCTO, que es insumo de almacén). Se le agregan las columnas que
-- la carta pública / panel de administración / carrito de reserva ya
-- necesitaban: categoría, precio de venta, unidad, imagen, cupo diario
-- y estado (para eliminación lógica).
-- ---------------------------------------------------------------------
ALTER TABLE `producto_emplatado`
  ADD COLUMN `categoria` VARCHAR(60) NULL AFTER `descripcion`,
  ADD COLUMN `precio` DECIMAL(10,2) NULL AFTER `categoria`,
  ADD COLUMN `unidad_de_medida` VARCHAR(30) NULL AFTER `precio`,
  ADD COLUMN `imagen_url` VARCHAR(500) NULL AFTER `unidad_de_medida`,
  ADD COLUMN `cupo_diario` INT(11) NULL AFTER `imagen_url`,
  ADD COLUMN `estado` TINYINT(1) NOT NULL DEFAULT 1 AFTER `cupo_diario`;

-- Si ya tenían "costo" cargado, lo usamos como precio de partida.
UPDATE `producto_emplatado` SET `precio` = `costo` WHERE `precio` IS NULL AND `costo` IS NOT NULL;
UPDATE `producto_emplatado` SET `categoria` = 'Plato Fuerte' WHERE `categoria` IS NULL;

-- ---------------------------------------------------------------------
-- RESERVA_PRODUCTO: el "carrito de platos" de una reserva. No existía
-- ninguna tabla puente entre RESERVA y PRODUCTO_EMPLATADO.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reserva_producto` (
  `id_reserva` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_reserva`, `id_producto`),
  CONSTRAINT `reserva_producto_ibfk_1` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`) ON DELETE CASCADE,
  CONSTRAINT `reserva_producto_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto_emplatado` (`id_producto_emplatado`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- FACTURA: ligada directo a la reserva (no solo a pedido) + datos que
-- financeModel.js ya generaba (número, monto, método de pago, cliente).
-- ---------------------------------------------------------------------
ALTER TABLE `factura`
  ADD COLUMN `id_reserva` INT(11) NULL AFTER `id_pedido`,
  ADD COLUMN `id_cliente` INT(11) NULL AFTER `id_reserva`,
  ADD COLUMN `numero_factura` VARCHAR(30) NULL AFTER `id_cliente`,
  ADD COLUMN `monto_total` DECIMAL(10,2) NULL AFTER `numero_factura`,
  ADD COLUMN `metodo_pago` VARCHAR(30) NOT NULL DEFAULT 'EFECTIVO' AFTER `monto_total`,
  ADD CONSTRAINT `factura_ibfk_2` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`),
  ADD CONSTRAINT `factura_ibfk_3` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`);

-- ---------------------------------------------------------------------
-- PAGO_EMPLEADO: concepto/periodo/estado + quién registró el pago.
-- ---------------------------------------------------------------------
ALTER TABLE `pago_empleado`
  ADD COLUMN `concepto` VARCHAR(150) NULL AFTER `observaciones`,
  ADD COLUMN `periodo` VARCHAR(30) NULL AFTER `concepto`,
  ADD COLUMN `estado` VARCHAR(20) NOT NULL DEFAULT 'PAGADO' AFTER `fecha_pago`,
  ADD COLUMN `id_registrado_por` INT(11) NULL AFTER `id_empleado`,
  ADD CONSTRAINT `pago_empleado_ibfk_2` FOREIGN KEY (`id_registrado_por`) REFERENCES `empleado` (`id_empleado`);

-- ---------------------------------------------------------------------
-- DETALLE_COMPRA: ahora también sirve como cabecera de compra a un
-- almacén (proveedor, fecha de emisión, monto total calculado por
-- trigger a partir de sus ítems), sin tocar el uso original ligado a
-- compra de equipamiento.
-- ---------------------------------------------------------------------
ALTER TABLE `detalle_compra`
  ADD COLUMN `id_almacen` INT(11) NULL AFTER `id_equipamiento`,
  ADD COLUMN `fecha_emision` DATE NULL AFTER `id_almacen`,
  ADD COLUMN `monto` DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER `fecha_emision`,
  ADD CONSTRAINT `detalle_compra_ibfk_2` FOREIGN KEY (`id_almacen`) REFERENCES `almacen` (`id_almacen`);

UPDATE `detalle_compra` SET `fecha_emision` = `fecha_compra` WHERE `fecha_emision` IS NULL;
UPDATE `detalle_compra` SET `monto` = COALESCE(`costo_adquisicion`, 0) WHERE `monto` = 0;

CREATE TABLE IF NOT EXISTS `detalle_compra_item` (
  `id_detalle_item` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id_detalle` int(11) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  CONSTRAINT `detalle_compra_item_ibfk_1` FOREIGN KEY (`id_detalle`) REFERENCES `detalle_compra` (`id_detalle`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recalcula el monto de la cabecera cada vez que cambian sus ítems
-- (pedido explícito del cliente: usar un procedimiento + cursor).
DELIMITER $$
CREATE PROCEDURE `sp_recalcular_monto_compra`(IN p_id_detalle INT)
BEGIN
    DECLARE v_fin INT DEFAULT 0;
    DECLARE v_cantidad DECIMAL(10,2);
    DECLARE v_precio DECIMAL(10,2);
    DECLARE v_total DECIMAL(10,2) DEFAULT 0;
    DECLARE cur_items CURSOR FOR
        SELECT cantidad, precio_unitario FROM `detalle_compra_item` WHERE id_detalle = p_id_detalle;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_fin = 1;

    OPEN cur_items;
    bucle_items: LOOP
        FETCH cur_items INTO v_cantidad, v_precio;
        IF v_fin = 1 THEN LEAVE bucle_items; END IF;
        SET v_total = v_total + (v_cantidad * v_precio);
    END LOOP;
    CLOSE cur_items;

    UPDATE `detalle_compra` SET `monto` = v_total WHERE `id_detalle` = p_id_detalle;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER `trg_compra_item_after_insert`
AFTER INSERT ON `detalle_compra_item`
FOR EACH ROW
BEGIN
    CALL sp_recalcular_monto_compra(NEW.id_detalle);
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER `trg_compra_item_after_delete`
AFTER DELETE ON `detalle_compra_item`
FOR EACH ROW
BEGIN
    CALL sp_recalcular_monto_compra(OLD.id_detalle);
END$$
DELIMITER ;

-- ---------------------------------------------------------------------
-- FUNCIÓN: total consumido en una reserva (carrito de platos)
-- ---------------------------------------------------------------------
DELIMITER $$
CREATE FUNCTION `fn_total_reserva`(p_id_reserva INT)
RETURNS DECIMAL(10,2)
READS SQL DATA
BEGIN
    DECLARE v_total DECIMAL(10,2);
    SELECT COALESCE(SUM(rp.cantidad * pe.precio), 0) INTO v_total
      FROM `reserva_producto` rp
      JOIN `producto_emplatado` pe ON pe.id_producto_emplatado = rp.id_producto
     WHERE rp.id_reserva = p_id_reserva;
    RETURN v_total;
END$$
DELIMITER ;

-- ---------------------------------------------------------------------
-- PROCEDIMIENTO: generar factura a partir de una reserva (transacción)
-- ---------------------------------------------------------------------
DELIMITER $$
CREATE PROCEDURE `sp_generar_factura`(
    IN p_id_reserva INT, IN p_numero VARCHAR(30), IN p_metodo_pago VARCHAR(30), OUT p_id_factura INT
)
BEGIN
    DECLARE v_id_cliente INT;
    DECLARE v_monto DECIMAL(10,2);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;

    START TRANSACTION;

    SELECT id_cliente INTO v_id_cliente FROM `reserva` WHERE id_reserva = p_id_reserva FOR UPDATE;
    IF v_id_cliente IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La reserva indicada no existe';
    END IF;

    SET v_monto = fn_total_reserva(p_id_reserva);

    INSERT INTO `factura` (nit, estado, fecha_emision, id_reserva, id_cliente, numero_factura, monto_total, metodo_pago)
    VALUES (NULL, 'EMITIDA', CURDATE(), p_id_reserva, v_id_cliente, p_numero, v_monto, COALESCE(p_metodo_pago, 'EFECTIVO'));

    SET p_id_factura = LAST_INSERT_ID();
    COMMIT;
END$$
DELIMITER ;

-- ---------------------------------------------------------------------
-- PROCEDIMIENTO: registrar pago a empleado (transacción + validación)
-- ---------------------------------------------------------------------
DELIMITER $$
CREATE PROCEDURE `sp_registrar_pago_empleado`(
    IN p_id_empleado INT, IN p_concepto VARCHAR(150), IN p_periodo VARCHAR(30),
    IN p_monto DECIMAL(10,2), IN p_fecha_pago DATE, IN p_id_registrado_por INT,
    OUT p_id_pago INT
)
BEGIN
    DECLARE v_activo TINYINT(1);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;

    START TRANSACTION;

    SELECT activo INTO v_activo FROM `empleado` WHERE id_empleado = p_id_empleado FOR UPDATE;
    IF v_activo IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El empleado indicado no existe';
    END IF;
    IF v_activo = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se puede pagar a un empleado inactivo';
    END IF;
    IF p_monto <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El monto del pago debe ser mayor a cero';
    END IF;

    INSERT INTO `pago_empleado` (observaciones, concepto, periodo, monto, fecha_pago, estado, id_empleado, id_registrado_por)
    VALUES (NULL, p_concepto, p_periodo, p_monto, p_fecha_pago, 'PAGADO', p_id_empleado, p_id_registrado_por);

    SET p_id_pago = LAST_INSERT_ID();
    COMMIT;
END$$
DELIMITER ;
