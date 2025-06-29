-- CreateTable
CREATE TABLE "event_email_customizations" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_email_customizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_email_customizations_eventId_template_locale_key" ON "event_email_customizations"("eventId", "template", "locale");

-- AddForeignKey
ALTER TABLE "event_email_customizations" ADD CONSTRAINT "event_email_customizations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
