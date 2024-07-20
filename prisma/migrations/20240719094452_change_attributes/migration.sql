/*
  Warnings:

  - You are about to drop the column `address` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "address",
DROP COLUMN "logo",
ADD COLUMN     "location" TEXT,
ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "address",
ADD COLUMN     "location" TEXT;
