-- =====================================================================
-- EL FOGÓN — Migración v3
-- Agrega el pago con QR para reservas hechas por el cliente:
--   - PAGO_RESERVA: una "solicitud de cobro" por reserva, con un código
--     único que se codifica en un QR (ver backend/utils/qrPago.js).
--   - El personal de caja/salón/admin aprueba o rechaza el pago
--     escaneando/tecleando el código. Al aprobarse, la reserva pasa a
--     CONFIRMADA (queda "activa") y se genera su factura automáticamente
--     reusando sp_generar_factura (ya existente desde migracion_v2.sql).
--
-- CÓMO USARLA: igual que migracion_v2.sql — ejecútala una sola vez
-- sobre tu base de datos (requiere haber corrido migracion_v2.sql antes,
-- porque depende de columnas/tablas que esa migración agrega).
-- =====================================================================
USE railway;

CREATE TABLE IF NOT EXISTS `pago_reserva` (
  `id_pago` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id_reserva` int(11) NOT NULL,
  `codigo` varchar(40) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `estado` enum('PENDIENTE','APROBADO','RECHAZADO') NOT NULL DEFAULT 'PENDIENTE',
  `fecha_generacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_expiracion` datetime NOT NULL,
  `fecha_resolucion` datetime NULL,
  `id_procesado_por` int(11) NULL,
  `observacion` varchar(255) NULL,
  UNIQUE KEY `uk_pago_reserva_codigo` (`codigo`),
  KEY `idx_pago_reserva_reserva` (`id_reserva`),
  CONSTRAINT `pago_reserva_ibfk_1` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`) ON DELETE CASCADE,
  CONSTRAINT `pago_reserva_ibfk_2` FOREIGN KEY (`id_procesado_por`) REFERENCES `empleado` (`id_empleado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
