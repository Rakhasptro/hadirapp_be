/*
  Warnings:

  - You are about to rename the column `grade` to `semester` on the `classes` table.
  - You are about to rename the column `major` to `course` on the `classes` table.
  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `classes` 
    RENAME COLUMN `grade` TO `semester`,
    RENAME COLUMN `major` TO `course`;

-- DropTable
DROP TABLE `audit_logs`;
