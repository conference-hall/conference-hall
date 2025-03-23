/*
  Warnings:

  - You are about to drop the `authentication_methods` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "authentication_methods" DROP CONSTRAINT "authentication_methods_userId_fkey";

-- DropTable
DROP TABLE "authentication_methods";
