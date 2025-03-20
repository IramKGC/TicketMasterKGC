-- AlterTable
ALTER TABLE `ticket` ADD COLUMN `estado` ENUM('Pendiente', 'En proceso', 'Completado') NOT NULL DEFAULT 'Pendiente';
