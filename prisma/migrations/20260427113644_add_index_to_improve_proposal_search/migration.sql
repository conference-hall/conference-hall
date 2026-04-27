-- DropIndex
DROP INDEX "reviews_proposalId_feeling_idx";

-- CreateIndex
CREATE INDEX "proposals_eventId_idx" ON "proposals"("eventId");

-- CreateIndex
CREATE INDEX "reviews_proposalId_feeling_note_idx" ON "reviews"("proposalId", "feeling", "note");
