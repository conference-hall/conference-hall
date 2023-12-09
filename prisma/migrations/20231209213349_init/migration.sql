-- CreateEnum
CREATE TYPE "TalkLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('MEETUP', 'CONFERENCE');

-- CreateEnum
CREATE TYPE "EventVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('OWNER', 'MEMBER', 'REVIEWER');

-- CreateEnum
CREATE TYPE "DeliberationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('NOT_PUBLISHED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ConfirmationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ReviewFeeling" AS ENUM ('POSITIVE', 'NEGATIVE', 'NEUTRAL', 'NO_OPINION');

-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('ORGANIZER', 'SPEAKER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "bio" TEXT,
    "picture" TEXT,
    "company" TEXT,
    "references" TEXT,
    "address" TEXT,
    "socials" JSONB NOT NULL DEFAULT '{}',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizerKey" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "picture" TEXT,
    "provider" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "organizer_key_access" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "organizer_key_access_pkey" PRIMARY KEY ("id")
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
    "invitationCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "talks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "EventType" NOT NULL DEFAULT 'CONFERENCE',
    "visibility" "EventVisibility" NOT NULL DEFAULT 'PRIVATE',
    "teamId" TEXT NOT NULL,
    "address" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "timezone" TEXT,
    "contactEmail" TEXT,
    "websiteUrl" TEXT,
    "codeOfConductUrl" TEXT,
    "logo" TEXT,
    "conferenceStart" TIMESTAMP(3),
    "conferenceEnd" TIMESTAMP(3),
    "cfpStart" TIMESTAMP(3),
    "cfpEnd" TIMESTAMP(3),
    "formatsRequired" BOOLEAN NOT NULL DEFAULT false,
    "categoriesRequired" BOOLEAN NOT NULL DEFAULT false,
    "maxProposals" INTEGER,
    "creatorId" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "reviewEnabled" BOOLEAN NOT NULL DEFAULT true,
    "displayProposalsReviews" BOOLEAN NOT NULL DEFAULT true,
    "displayProposalsSpeakers" BOOLEAN NOT NULL DEFAULT true,
    "surveyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "surveyQuestions" JSONB,
    "emailOrganizer" TEXT,
    "emailNotifications" JSONB,
    "slackWebhookUrl" TEXT,
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
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "invitationCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams_members" (
    "memberId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'REVIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_members_pkey" PRIMARY KEY ("memberId","teamId")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "talkId" TEXT,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "level" "TalkLevel",
    "languages" JSONB DEFAULT '[]',
    "references" TEXT,
    "comments" TEXT,
    "avgRateForSort" DOUBLE PRECISION,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliberationStatus" "DeliberationStatus" NOT NULL DEFAULT 'PENDING',
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'NOT_PUBLISHED',
    "confirmationStatus" "ConfirmationStatus",
    "invitationCode" TEXT NOT NULL,
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
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "feeling" "ReviewFeeling" NOT NULL DEFAULT 'NEUTRAL',
    "note" INTEGER,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "_speakers_talks" (
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

-- CreateTable
CREATE TABLE "_speakers_proposals" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "talks_invitationCode_key" ON "talks"("invitationCode");

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "teams_slug_key" ON "teams"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "teams_invitationCode_key" ON "teams"("invitationCode");

-- CreateIndex
CREATE UNIQUE INDEX "proposals_invitationCode_key" ON "proposals"("invitationCode");

-- CreateIndex
CREATE UNIQUE INDEX "proposals_talkId_eventId_key" ON "proposals"("talkId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "surveys_id_key" ON "surveys"("id");

-- CreateIndex
CREATE UNIQUE INDEX "surveys_userId_eventId_key" ON "surveys"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_userId_proposalId_key" ON "reviews"("userId", "proposalId");

-- CreateIndex
CREATE UNIQUE INDEX "_speakers_talks_AB_unique" ON "_speakers_talks"("A", "B");

-- CreateIndex
CREATE INDEX "_speakers_talks_B_index" ON "_speakers_talks"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_proposals_formats_AB_unique" ON "_proposals_formats"("A", "B");

-- CreateIndex
CREATE INDEX "_proposals_formats_B_index" ON "_proposals_formats"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_proposals_categories_AB_unique" ON "_proposals_categories"("A", "B");

-- CreateIndex
CREATE INDEX "_proposals_categories_B_index" ON "_proposals_categories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_speakers_proposals_AB_unique" ON "_speakers_proposals"("A", "B");

-- CreateIndex
CREATE INDEX "_speakers_proposals_B_index" ON "_speakers_proposals"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizerKey_fkey" FOREIGN KEY ("organizerKey") REFERENCES "organizer_key_access"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talks" ADD CONSTRAINT "talks_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_formats" ADD CONSTRAINT "event_formats_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_categories" ADD CONSTRAINT "event_categories_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams_members" ADD CONSTRAINT "teams_members_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams_members" ADD CONSTRAINT "teams_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_talkId_fkey" FOREIGN KEY ("talkId") REFERENCES "talks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_speakers_talks" ADD CONSTRAINT "_speakers_talks_A_fkey" FOREIGN KEY ("A") REFERENCES "talks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_speakers_talks" ADD CONSTRAINT "_speakers_talks_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposals_formats" ADD CONSTRAINT "_proposals_formats_A_fkey" FOREIGN KEY ("A") REFERENCES "event_formats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposals_formats" ADD CONSTRAINT "_proposals_formats_B_fkey" FOREIGN KEY ("B") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposals_categories" ADD CONSTRAINT "_proposals_categories_A_fkey" FOREIGN KEY ("A") REFERENCES "event_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposals_categories" ADD CONSTRAINT "_proposals_categories_B_fkey" FOREIGN KEY ("B") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_speakers_proposals" ADD CONSTRAINT "_speakers_proposals_A_fkey" FOREIGN KEY ("A") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_speakers_proposals" ADD CONSTRAINT "_speakers_proposals_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;