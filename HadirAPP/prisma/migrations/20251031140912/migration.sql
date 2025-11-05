/*
  Warnings:

  - Added the required column `teacherId` to the `attendance_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `attendance_sessions` ADD COLUMN `teacherId` VARCHAR(191) NOT NULL;
