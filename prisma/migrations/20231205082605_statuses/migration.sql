/*
  Warnings:

  - You are about to drop the column `status` on the `proposals` table. All the data in the column will be lost.
  - Made the column `submittedAt` on table `proposals` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "DeliberationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ConfirmationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DECLINED');

-- AlterTable
ALTER TABLE "proposals" DROP COLUMN "status",
ADD COLUMN     "confirmationStatus" "ConfirmationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "deliberationStatus" "DeliberationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "isDraft" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "submittedAt" SET NOT NULL,
ALTER COLUMN "submittedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropEnum
DROP TYPE "ProposalStatus";
