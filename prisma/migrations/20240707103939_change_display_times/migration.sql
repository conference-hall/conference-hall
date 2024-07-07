/*
  Warnings:

  - You are about to drop the column `displayEndHour` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `displayStartHour` on the `schedules` table. All the data in the column will be lost.
  - Added the required column `displayEndMinutes` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayStartMinutes` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "displayEndHour",
DROP COLUMN "displayStartHour",
ADD COLUMN     "displayEndMinutes" INTEGER NOT NULL,
ADD COLUMN     "displayStartMinutes" INTEGER NOT NULL;
