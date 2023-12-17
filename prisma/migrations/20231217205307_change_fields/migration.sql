/*
  Warnings:

  - Made the column `surveyQuestions` on table `events` required. This step will fail if there are existing NULL values in that column.
  - Made the column `emailNotifications` on table `events` required. This step will fail if there are existing NULL values in that column.
  - Made the column `languages` on table `proposals` required. This step will fail if there are existing NULL values in that column.
  - Made the column `languages` on table `talks` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "events" ALTER COLUMN "surveyQuestions" SET NOT NULL,
ALTER COLUMN "surveyQuestions" SET DEFAULT '[]',
ALTER COLUMN "emailNotifications" SET NOT NULL,
ALTER COLUMN "emailNotifications" SET DEFAULT '[]';

-- AlterTable
ALTER TABLE "proposals" ALTER COLUMN "languages" SET NOT NULL;

-- AlterTable
ALTER TABLE "surveys" ALTER COLUMN "answers" SET DEFAULT '{}';

-- AlterTable
ALTER TABLE "talks" ALTER COLUMN "languages" SET NOT NULL,
ALTER COLUMN "languages" SET DEFAULT '[]';
