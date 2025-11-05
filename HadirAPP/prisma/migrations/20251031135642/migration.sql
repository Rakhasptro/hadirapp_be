/*
  Warnings:

  - You are about to drop the column `autoCloseMinutes` on the `attendance_sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `attendance_sessions` DROP COLUMN `autoCloseMinutes`,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'OPEN';
