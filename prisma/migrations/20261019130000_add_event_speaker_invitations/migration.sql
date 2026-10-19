-- CreateEnum
CREATE TYPE "EventSpeakerInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELED');

-- CreateTable
CREATE TABLE "event_speaker_invitations" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "invitedById" TEXT,
    "email" TEXT NOT NULL,
    "message" TEXT,
    "token" TEXT,
    "status" "EventSpeakerInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_speaker_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_speaker_invitations_token_key" ON "event_speaker_invitations"("token");

-- CreateIndex
CREATE INDEX "event_speaker_invitations_userId_idx" ON "event_speaker_invitations"("userId");

-- CreateIndex
CREATE INDEX "event_speaker_invitations_invitedById_idx" ON "event_speaker_invitations"("invitedById");

-- CreateIndex
CREATE UNIQUE INDEX "event_speaker_invitations_eventId_userId_key" ON "event_speaker_invitations"("eventId", "userId");

-- AddForeignKey
ALTER TABLE "event_speaker_invitations" ADD CONSTRAINT "event_speaker_invitations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_speaker_invitations" ADD CONSTRAINT "event_speaker_invitations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_speaker_invitations" ADD CONSTRAINT "event_speaker_invitations_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
