-- =====================================================================
-- EL FOGÓN — Migración v4
-- Soporte para el registro de empleados que quedan "Pendiente" hasta que
-- administración apruebe su permiso para trabajar (ver
-- backend/controllers/empleadoController.js).
--
-- No se necesita una tabla nueva: el estado de la solicitud usa la
-- misma columna `empleado.estado` que ya existía (ahora con los valores
-- 'Pendiente', 'Activo', 'Rechazado', además de los que ya usaban --
-- 'Activo', 'Inactivo', 'Vacaciones', 'Licencia Médica', etc.).
-- Esta migración solo agrega dónde guardar el motivo si se rechaza.
--
-- CÓMO USARLA: igual que las anteriores, una sola vez sobre tu base de
-- datos (requiere haber corrido migracion_v2.sql y migracion_v3.sql antes).
-- =====================================================================
USE railway;

ALTER TABLE `empleado`
  ADD COLUMN IF NOT EXISTS `motivo_rechazo` varchar(255) NULL AFTER `estado`;
