-- AlterTable
ALTER TABLE `students` ADD COLUMN `address` TEXT NULL,
    ADD COLUMN `classId` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `students_classId_fkey` ON `students`(`classId`);

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `classes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
