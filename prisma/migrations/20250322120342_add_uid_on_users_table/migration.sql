/*
  Warnings:

  - You are about to drop the column `emailVerified` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "emailVerified",
ADD COLUMN     "uid" TEXT;

-- CreateIndex
CREATE INDEX "users_uid_idx" ON "users"("uid");
