/*
  Warnings:

  - You are about to drop the column `estado` on the `ticket` table. All the data in the column will be lost.
  - You are about to drop the column `fecha` on the `ticket` table. All the data in the column will be lost.
  - You are about to drop the column `responsable` on the `ticket` table. All the data in the column will be lost.
  - You are about to alter the column `asunto` on the `ticket` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to drop the column `createdAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoria` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urgencia` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Made the column `descripcion` on table `ticket` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `departamento` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rol` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `User_email_key` ON `user`;

-- AlterTable
ALTER TABLE `ticket` DROP COLUMN `estado`,
    DROP COLUMN `fecha`,
    DROP COLUMN `responsable`,
    ADD COLUMN `categoria` ENUM('Desarrollo', 'Soporte', 'Redes', 'Correos') NOT NULL,
    ADD COLUMN `urgencia` ENUM('Baja', 'Media', 'Alta') NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL,
    MODIFY `asunto` VARCHAR(191) NOT NULL,
    MODIFY `departamento` VARCHAR(191) NOT NULL,
    MODIFY `descripcion` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `createdAt`,
    DROP COLUMN `email`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `departamento` VARCHAR(191) NOT NULL,
    ADD COLUMN `rol` VARCHAR(191) NOT NULL,
    ADD COLUMN `username` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
