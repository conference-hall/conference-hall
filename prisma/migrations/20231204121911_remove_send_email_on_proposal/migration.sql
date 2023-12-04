/*
  Warnings:

  - You are about to drop the column `emailAcceptedStatus` on the `proposals` table. All the data in the column will be lost.
  - You are about to drop the column `emailRejectedStatus` on the `proposals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "proposals" DROP COLUMN "emailAcceptedStatus",
DROP COLUMN "emailRejectedStatus";

-- DropEnum
DROP TYPE "EmailStatus";
