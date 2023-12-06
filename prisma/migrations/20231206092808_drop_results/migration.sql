/*
  Warnings:

  - You are about to drop the `result_publications` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('NOT_PUBLISHED', 'PUBLISHED');

-- DropForeignKey
ALTER TABLE "result_publications" DROP CONSTRAINT "result_publications_proposalId_fkey";

-- AlterTable
ALTER TABLE "proposals" ADD COLUMN     "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'NOT_PUBLISHED';

-- DropTable
DROP TABLE "result_publications";

-- DropEnum
DROP TYPE "ResultEmailStatus";

-- DropEnum
DROP TYPE "ResultPublicationType";
