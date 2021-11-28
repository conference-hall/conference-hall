-- CreateEnum
CREATE TYPE "TalkLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('MEETUP', 'CONFERENCE');

-- CreateEnum
CREATE TYPE "EventVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'MEMBER', 'REVIEWER');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('SUBMITTED', 'ACCEPTED', 'REJECTED', 'CONFIRMED', 'DECLINED');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('SENT', 'DELIVERED');

-- CreateEnum
CREATE TYPE "RatingFeeling" AS ENUM ('POSITIVE', 'NEGATIVE', 'NEUTRAL', 'NO_OPINION');

-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('ORGANIZER', 'SPEAKER');

-- CreateEnum
CREATE TYPE "InviteType" AS ENUM ('ORGANIZATION', 'SPEAKER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "bio" TEXT,
    "photoURL" TEXT,
    "betaAccess" TEXT,
    "github" TEXT,
    "company" TEXT,
    "references" TEXT,
    "twitter" TEXT,
    "address" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "level" "TalkLevel",
    "languages" JSONB,
    "references" TEXT,
    "creatorId" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "invitationUuid" TEXT,

    CONSTRAINT "talks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beta_keys" (
    "id" TEXT NOT NULL,
    "organization" TEXT,

    CONSTRAINT "beta_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "EventType" NOT NULL DEFAULT E'CONFERENCE',
    "visibility" "EventVisibility" NOT NULL DEFAULT E'PRIVATE',
    "organizationId" TEXT,
    "address" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "timezone" TEXT,
    "contact" TEXT,
    "website" TEXT,
    "bannerUrl" TEXT,
    "conferenceStart" TIMESTAMP(3),
    "conferenceEnd" TIMESTAMP(3),
    "cfpStart" TIMESTAMP(3),
    "cfpEnd" TIMESTAMP(3),
    "formatsRequired" BOOLEAN NOT NULL DEFAULT false,
    "categoriesRequired" BOOLEAN NOT NULL DEFAULT false,
    "maxProposals" INTEGER,
    "creatorId" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "deliberationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "displayOrganizersRatings" BOOLEAN NOT NULL DEFAULT true,
    "displayProposalsRatings" BOOLEAN NOT NULL DEFAULT true,
    "displayProposalsSpeakers" BOOLEAN NOT NULL DEFAULT true,
    "surveyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "surveyQuestions" JSONB,
    "emailOrganizer" TEXT,
    "emailNotifications" JSONB,
    "slackWebhookUrl" TEXT,
    "slackNotifications" JSONB,
    "apiKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_formats" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "event_formats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "event_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "invitationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations_members" (
    "memberId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL DEFAULT E'REVIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_members_pkey" PRIMARY KEY ("memberId","organizationId")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "talkId" TEXT,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "level" "TalkLevel",
    "languages" JSONB,
    "references" TEXT,
    "comments" TEXT,
    "avgRateForSort" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "ProposalStatus" NOT NULL DEFAULT E'SUBMITTED',
    "emailStatus" "EmailStatus",
    "speakerNotified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surveys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "feeling" "RatingFeeling" NOT NULL DEFAULT E'NEUTRAL',
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "channel" "MessageChannel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invites" (
    "id" TEXT NOT NULL,
    "type" "InviteType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_speakers_talks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_speakers_proposals" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_proposals_formats" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_proposals_categories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "talks_invitationUuid_key" ON "talks"("invitationUuid");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_invitationId_key" ON "organizations"("invitationId");

-- CreateIndex
CREATE UNIQUE INDEX "proposals_talkId_eventId_key" ON "proposals"("talkId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "surveys_id_key" ON "surveys"("id");

-- CreateIndex
CREATE UNIQUE INDEX "surveys_userId_eventId_key" ON "surveys"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_userId_proposalId_key" ON "ratings"("userId", "proposalId");

-- CreateIndex
CREATE UNIQUE INDEX "invites_type_entityId_key" ON "invites"("type", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "_speakers_talks_AB_unique" ON "_speakers_talks"("A", "B");

-- CreateIndex
CREATE INDEX "_speakers_talks_B_index" ON "_speakers_talks"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_speakers_proposals_AB_unique" ON "_speakers_proposals"("A", "B");

-- CreateIndex
CREATE INDEX "_speakers_proposals_B_index" ON "_speakers_proposals"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_proposals_formats_AB_unique" ON "_proposals_formats"("A", "B");

-- CreateIndex
CREATE INDEX "_proposals_formats_B_index" ON "_proposals_formats"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_proposals_categories_AB_unique" ON "_proposals_categories"("A", "B");

-- CreateIndex
CREATE INDEX "_proposals_categories_B_index" ON "_proposals_categories"("B");

-- AddForeignKey
ALTER TABLE "talks" ADD CONSTRAINT "talks_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talks" ADD CONSTRAINT "talks_invitationUuid_fkey" FOREIGN KEY ("invitationUuid") REFERENCES "invites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_formats" ADD CONSTRAINT "event_formats_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_categories" ADD CONSTRAINT "event_categories_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations_members" ADD CONSTRAINT "organizations_members_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations_members" ADD CONSTRAINT "organizations_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_talkId_fkey" FOREIGN KEY ("talkId") REFERENCES "talks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_speakers_talks" ADD FOREIGN KEY ("A") REFERENCES "talks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_speakers_talks" ADD FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_speakers_proposals" ADD FOREIGN KEY ("A") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_speakers_proposals" ADD FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposals_formats" ADD FOREIGN KEY ("A") REFERENCES "event_formats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposals_formats" ADD FOREIGN KEY ("B") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposals_categories" ADD FOREIGN KEY ("A") REFERENCES "event_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposals_categories" ADD FOREIGN KEY ("B") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
