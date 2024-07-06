/*
  Warnings:

  - Added the required column `displayEnd` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayStart` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "displayEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "displayStart" TIMESTAMP(3) NOT NULL;
