/*
  Warnings:

  - A unique constraint covering the columns `[proposalNumber,eventId]` on the table `proposals` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "proposals" ADD COLUMN     "proposalNumber" INTEGER;

-- CreateTable
CREATE TABLE "event_proposal_counters" (
    "eventId" TEXT NOT NULL,
    "lastProposalNumber" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "event_proposal_counters_pkey" PRIMARY KEY ("eventId")
);

-- CreateIndex
CREATE UNIQUE INDEX "proposals_proposalNumber_eventId_key" ON "proposals"("proposalNumber", "eventId");

-- AddForeignKey
ALTER TABLE "event_proposal_counters" ADD CONSTRAINT "event_proposal_counters_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
