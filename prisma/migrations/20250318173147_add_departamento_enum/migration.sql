/*
  Warnings:

  - You are about to alter the column `departamento` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `departamento` ENUM('Sistemas', 'Recursos Humanos', 'Finanzas', 'Monitoreo', 'Seguridad Patrimonial', 'Operaciones', 'Ventas') NOT NULL;
