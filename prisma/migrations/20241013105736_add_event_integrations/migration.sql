-- CreateEnum
CREATE TYPE "EventIntegrationName" AS ENUM ('OPEN_PLANNER');

-- CreateTable
CREATE TABLE "event_integration_configurations" (
    "id" TEXT NOT NULL,
    "name" "EventIntegrationName" NOT NULL,
    "configuration" JSONB NOT NULL DEFAULT '{}',
    "eventId" TEXT NOT NULL,

    CONSTRAINT "event_integration_configurations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "event_integration_configurations" ADD CONSTRAINT "event_integration_configurations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
