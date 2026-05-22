-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PROPOSAL_ACCEPTED', 'PROPOSAL_REJECTED', 'PROPOSAL_MESSAGE_RECEIVED');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "messageId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_userId_read_createdAt_idx" ON "notifications"("userId", "read", "createdAt");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "conversation_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data migration: backfill notifications for existing accepted/published/pending proposals
INSERT INTO "notifications" ("id", "type", "userId", "eventId", "proposalId", "read", "createdAt")
SELECT
    gen_random_uuid(),
    'PROPOSAL_ACCEPTED'::"NotificationType",
    es."userId",
    p."eventId",
    p."id",
    false,
    p."updatedAt"
FROM "proposals" p
JOIN "_proposals_speakers" ps ON ps."B" = p."id"
JOIN "event_speakers" es ON es."id" = ps."A"
WHERE p."deliberationStatus" = 'ACCEPTED'
  AND p."publicationStatus" = 'PUBLISHED'
  AND p."confirmationStatus" = 'PENDING'
  AND es."userId" IS NOT NULL;
