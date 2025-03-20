-- CreateTable
CREATE TABLE `Ticket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `asunto` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL,
    `departamento` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `responsable` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
