/*
  Warnings:

  - You are about to drop the `organizer_key_access` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TeamAccessRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_organizerKey_fkey";

-- DropTable
DROP TABLE "organizer_key_access";

-- CreateTable
CREATE TABLE "team_access_requests" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "TeamAccessRequestStatus" NOT NULL DEFAULT 'PENDING',
    "token" TEXT,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_access_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "team_access_requests_token_key" ON "team_access_requests"("token");
