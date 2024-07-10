/*
  Warnings:

  - Added the required column `color` to the `schedule_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedule_sessions" ADD COLUMN     "color" TEXT NOT NULL;
