/*
  Warnings:

  - You are about to alter the column `gender` on the `teachers` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(1)`.

*/
-- AlterTable
ALTER TABLE `teachers` MODIFY `gender` CHAR(1) NULL;
