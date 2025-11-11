/*
  Warnings:

  - You are about to drop the column `address` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `students` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `students` DROP FOREIGN KEY `students_classId_fkey`;

-- DropIndex
DROP INDEX `students_classId_fkey` ON `students`;

-- AlterTable
ALTER TABLE `students` DROP COLUMN `address`,
    DROP COLUMN `classId`,
    DROP COLUMN `phone`;
