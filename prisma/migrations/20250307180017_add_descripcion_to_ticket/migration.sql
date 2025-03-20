/*
  Warnings:

  - You are about to alter the column `estado` on the `ticket` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - You are about to alter the column `departamento` on the `ticket` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `responsable` on the `ticket` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE `ticket` ADD COLUMN `descripcion` TEXT NULL,
    MODIFY `asunto` VARCHAR(255) NOT NULL,
    MODIFY `estado` ENUM('Pendiente', 'En proceso', 'Completado') NOT NULL,
    MODIFY `departamento` VARCHAR(100) NOT NULL,
    MODIFY `fecha` DATE NOT NULL,
    MODIFY `responsable` VARCHAR(100) NOT NULL;
