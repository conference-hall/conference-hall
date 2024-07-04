/*
  Warnings:

  - Made the column `timezone` on table `events` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "events" ALTER COLUMN "timezone" SET NOT NULL;
