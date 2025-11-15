/*
  Warnings:

  - You are about to drop the column `surveyEnabled` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `surveyQuestions` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "surveyEnabled",
DROP COLUMN "surveyQuestions";
