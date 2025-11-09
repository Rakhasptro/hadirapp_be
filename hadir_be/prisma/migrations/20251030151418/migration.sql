/*
  Warnings:

  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `admins` DROP FOREIGN KEY `admins_userId_fkey`;

-- DropTable
DROP TABLE `admins`;
