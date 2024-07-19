/*
  Warnings:

  - Made the column `name` on table `authentication_methods` required. This step will fail if there are existing NULL values in that column.
  - Made the column `provider` on table `authentication_methods` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "authentication_methods" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "provider" SET NOT NULL;
