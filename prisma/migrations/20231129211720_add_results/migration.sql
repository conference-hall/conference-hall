/*
  Warnings:

  - You are about to drop the column `acceptedAt` on the `proposals` table. All the data in the column will be lost.
  - You are about to drop the column `confirmedAt` on the `proposals` table. All the data in the column will be lost.
  - You are about to drop the column `declinedAt` on the `proposals` table. All the data in the column will be lost.
  - You are about to drop the column `rejectedAt` on the `proposals` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ResultEmailStatus" AS ENUM ('NONE', 'SENT');

-- CreateEnum
CREATE TYPE "ResultPublicationType" AS ENUM ('ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "proposals" DROP COLUMN "acceptedAt",
DROP COLUMN "confirmedAt",
DROP COLUMN "declinedAt",
DROP COLUMN "rejectedAt",
ALTER COLUMN "languages" SET DEFAULT '[]';

-- CreateTable
CREATE TABLE "result_publications" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "type" "ResultPublicationType" NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailStatus" "ResultEmailStatus" NOT NULL DEFAULT 'NONE',

    CONSTRAINT "result_publications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "result_publications_proposalId_key" ON "result_publications"("proposalId");

-- AddForeignKey
ALTER TABLE "result_publications" ADD CONSTRAINT "result_publications_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
