-- CreateIndex
CREATE INDEX "proposals_eventId_submittedAt_idx" ON "proposals"("eventId", "submittedAt" DESC) WHERE ("isDraft" = false AND "archivedAt" IS NULL);
