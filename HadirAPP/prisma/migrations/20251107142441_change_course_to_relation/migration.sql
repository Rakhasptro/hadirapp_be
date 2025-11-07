/*
  Warnings:

  - You are about to drop the column `course` on the `classes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `classes` DROP COLUMN `course`,
    ADD COLUMN `courseId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `classes_courseId_fkey` ON `classes`(`courseId`);

-- AddForeignKey
ALTER TABLE `classes` ADD CONSTRAINT `classes_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
