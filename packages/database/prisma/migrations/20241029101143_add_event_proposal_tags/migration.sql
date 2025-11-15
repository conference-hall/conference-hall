-- CreateTable
CREATE TABLE "event_proposal_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_proposal_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_proposal_to_event_proposal_tags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_proposal_to_event_proposal_tags_AB_unique" ON "_proposal_to_event_proposal_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_proposal_to_event_proposal_tags_B_index" ON "_proposal_to_event_proposal_tags"("B");

-- AddForeignKey
ALTER TABLE "event_proposal_tags" ADD CONSTRAINT "event_proposal_tags_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposal_to_event_proposal_tags" ADD CONSTRAINT "_proposal_to_event_proposal_tags_A_fkey" FOREIGN KEY ("A") REFERENCES "event_proposal_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposal_to_event_proposal_tags" ADD CONSTRAINT "_proposal_to_event_proposal_tags_B_fkey" FOREIGN KEY ("B") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
