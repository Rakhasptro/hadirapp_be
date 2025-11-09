/*
  Warnings:

  - You are about to drop the column `checkInTime` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `deviceInfo` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `attendances` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `attendances` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - You are about to drop the column `address` on the `teachers` table. All the data in the column will be lost.
  - You are about to alter the column `role` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(2))`.
  - You are about to drop the `attendance_sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `classes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `courses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `leave_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `schedules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `students` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wifi_networks` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[scheduleId,studentNpm]` on the table `attendances` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `scheduleId` to the `attendances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selfieImage` to the `attendances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentName` to the `attendances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentNpm` to the `attendances` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `attendance_sessions` DROP FOREIGN KEY `attendance_sessions_scheduleId_fkey`;

-- DropForeignKey
ALTER TABLE `attendances` DROP FOREIGN KEY `attendances_sessionId_fkey`;

-- DropForeignKey
ALTER TABLE `attendances` DROP FOREIGN KEY `attendances_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `classes` DROP FOREIGN KEY `classes_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `courses` DROP FOREIGN KEY `courses_teacherId_fkey`;

-- DropForeignKey
ALTER TABLE `leave_requests` DROP FOREIGN KEY `leave_requests_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `schedules` DROP FOREIGN KEY `schedules_classId_fkey`;

-- DropForeignKey
ALTER TABLE `schedules` DROP FOREIGN KEY `schedules_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `schedules` DROP FOREIGN KEY `schedules_teacherId_fkey`;

-- DropForeignKey
ALTER TABLE `schedules` DROP FOREIGN KEY `schedules_wifiNetworkId_fkey`;

-- DropForeignKey
ALTER TABLE `students` DROP FOREIGN KEY `students_classId_fkey`;

-- DropForeignKey
ALTER TABLE `students` DROP FOREIGN KEY `students_userId_fkey`;

-- DropIndex
DROP INDEX `attendances_sessionId_studentId_key` ON `attendances`;

-- DropIndex
DROP INDEX `attendances_studentId_fkey` ON `attendances`;

-- AlterTable
ALTER TABLE `attendances` DROP COLUMN `checkInTime`,
    DROP COLUMN `deviceInfo`,
    DROP COLUMN `ipAddress`,
    DROP COLUMN `latitude`,
    DROP COLUMN `longitude`,
    DROP COLUMN `notes`,
    DROP COLUMN `sessionId`,
    DROP COLUMN `studentId`,
    ADD COLUMN `confirmedAt` DATETIME(3) NULL,
    ADD COLUMN `confirmedBy` VARCHAR(191) NULL,
    ADD COLUMN `rejectionReason` TEXT NULL,
    ADD COLUMN `scannedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `scheduleId` VARCHAR(191) NOT NULL,
    ADD COLUMN `selfieImage` VARCHAR(191) NOT NULL,
    ADD COLUMN `studentName` VARCHAR(191) NOT NULL,
    ADD COLUMN `studentNpm` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('PENDING', 'CONFIRMED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `teachers` DROP COLUMN `address`;

-- Delete users with non-TEACHER roles before enum change
DELETE FROM `users` WHERE `role` NOT IN ('TEACHER');

-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('TEACHER') NOT NULL DEFAULT 'TEACHER';

-- DropTable
DROP TABLE `attendance_sessions`;

-- DropTable
DROP TABLE `classes`;

-- DropTable
DROP TABLE `courses`;

-- DropTable
DROP TABLE `leave_requests`;

-- DropTable
DROP TABLE `notifications`;

-- DropTable
DROP TABLE `schedules`;

-- DropTable
DROP TABLE `students`;

-- DropTable
DROP TABLE `wifi_networks`;

-- CreateTable
CREATE TABLE `course_schedules` (
    `id` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NOT NULL,
    `courseName` VARCHAR(191) NOT NULL,
    `courseCode` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `room` VARCHAR(191) NULL,
    `topic` VARCHAR(191) NULL,
    `qrCode` VARCHAR(191) NULL,
    `qrCodeImage` TEXT NULL,
    `status` ENUM('SCHEDULED', 'ACTIVE', 'CLOSED') NOT NULL DEFAULT 'SCHEDULED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `course_schedules_qrCode_key`(`qrCode`),
    INDEX `course_schedules_teacherId_fkey`(`teacherId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `attendances_scheduleId_fkey` ON `attendances`(`scheduleId`);

-- CreateIndex
CREATE INDEX `attendances_status_idx` ON `attendances`(`status`);

-- CreateIndex
CREATE UNIQUE INDEX `attendances_scheduleId_studentNpm_key` ON `attendances`(`scheduleId`, `studentNpm`);

-- AddForeignKey
ALTER TABLE `course_schedules` ADD CONSTRAINT `course_schedules_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `teachers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendances` ADD CONSTRAINT `attendances_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `course_schedules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
