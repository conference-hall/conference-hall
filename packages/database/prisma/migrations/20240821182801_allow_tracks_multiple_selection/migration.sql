-- AlterTable
ALTER TABLE "events" ADD COLUMN     "categoriesAllowMultiple" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "formatsAllowMultiple" BOOLEAN NOT NULL DEFAULT false;
