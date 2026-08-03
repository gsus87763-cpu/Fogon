-- =====================================================================
-- EL FOGÓN — Migración v5
-- Permite asignar un rol de trabajo (agente de salón, cajero, cocinero,
-- etc.) directamente al aprobar una solicitud de personal, sin depender
-- del modelo de "responsable de área" (que solo admite una persona por
-- área y no alcanza para varios meseros/cajeros).
--
-- Ver: backend/controllers/authController.js (obtenerRolEmpleado),
--      backend/models/empleadoModel.js (aprobar).
--
-- CÓMO USARLA: igual que las anteriores, una sola vez sobre tu base de
-- datos (requiere haber corrido migracion_v2/v3/v4.sql antes).
-- =====================================================================
USE railway;

ALTER TABLE `empleado`
  ADD COLUMN IF NOT EXISTS `rol_manual` varchar(30) NULL AFTER `motivo_rechazo`;
