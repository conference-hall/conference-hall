-- DropIndex
DROP INDEX "proposals_eventId_submittedAt_idx";

-- DropIndex
DROP INDEX "proposals_eventId_idx";

-- CreateIndex
CREATE INDEX "proposals_eventId_submittedAt_idx" ON "proposals"("eventId", "submittedAt" DESC);
