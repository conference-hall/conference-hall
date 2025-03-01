-- CreateTable
CREATE TABLE "event-speakers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "bio" TEXT,
    "picture" TEXT,
    "company" TEXT,
    "location" TEXT,
    "references" TEXT,
    "socialLinks" JSONB NOT NULL DEFAULT '[]',
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event-speakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_proposals_speakers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_proposals_speakers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_proposals_speakers_B_index" ON "_proposals_speakers"("B");

-- AddForeignKey
ALTER TABLE "event-speakers" ADD CONSTRAINT "event-speakers_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event-speakers" ADD CONSTRAINT "event-speakers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposals_speakers" ADD CONSTRAINT "_proposals_speakers_A_fkey" FOREIGN KEY ("A") REFERENCES "event-speakers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposals_speakers" ADD CONSTRAINT "_proposals_speakers_B_fkey" FOREIGN KEY ("B") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
