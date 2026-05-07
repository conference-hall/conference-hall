-- CreateEnum
CREATE TYPE "TeamAccessRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED');

-- CreateTable
CREATE TABLE "team_access_requests" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "eventName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT,
    "status" "TeamAccessRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "team_access_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "team_access_requests_token_key" ON "team_access_requests"("token") WHERE "token" IS NOT NULL;

-- CreateIndex
CREATE INDEX "team_access_requests_status_idx" ON "team_access_requests"("status");
