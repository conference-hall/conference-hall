/*
  Warnings:

  - You are about to drop the column `displayEnd` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `displayStart` on the `schedules` table. All the data in the column will be lost.
  - Added the required column `displayEndHour` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayStartHour` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "displayEnd",
DROP COLUMN "displayStart",
ADD COLUMN     "displayEndHour" INTEGER NOT NULL,
ADD COLUMN     "displayStartHour" INTEGER NOT NULL;
