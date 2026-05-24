-- AlterTable
ALTER TABLE "conversation_participants" ADD COLUMN     "lastSeenAt" TIMESTAMP(3);

-- Backfill existing rows so historical conversations don't appear as "new"
UPDATE "conversation_participants" SET "lastSeenAt" = NOW() WHERE "lastSeenAt" IS NULL;
