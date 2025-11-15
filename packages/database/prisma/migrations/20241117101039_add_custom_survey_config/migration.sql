-- AlterTable
ALTER TABLE "events" ADD COLUMN     "surveyConfig" JSONB NOT NULL DEFAULT '{}';
