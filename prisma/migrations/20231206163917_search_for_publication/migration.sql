-- AlterTable
ALTER TABLE "proposals" ALTER COLUMN "confirmationStatus" DROP NOT NULL,
ALTER COLUMN "confirmationStatus" DROP DEFAULT;
