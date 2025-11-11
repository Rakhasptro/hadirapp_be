/*
  Warnings:

  - Made the column `startTime` on table `attendance_sessions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `attendance_sessions` MODIFY `startTime` DATETIME(3) NOT NULL;
