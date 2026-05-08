-- CreateEnum
CREATE TYPE "TeamAccessRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

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
