/*
  Warnings:

  - You are about to drop the `organizer_key_access` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_organizerKey_fkey";

-- DropTable
DROP TABLE "organizer_key_access";
