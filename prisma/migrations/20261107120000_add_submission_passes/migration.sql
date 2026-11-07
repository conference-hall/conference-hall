-- CreateTable
CREATE TABLE "submission_passes" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submission_passes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "submission_passes_code_key" ON "submission_passes"("code");

-- CreateIndex
CREATE INDEX "submission_passes_eventId_idx" ON "submission_passes"("eventId");

-- CreateIndex
CREATE INDEX "submission_passes_userId_idx" ON "submission_passes"("userId");

-- AddForeignKey
ALTER TABLE "submission_passes" ADD CONSTRAINT "submission_passes_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_passes" ADD CONSTRAINT "submission_passes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

