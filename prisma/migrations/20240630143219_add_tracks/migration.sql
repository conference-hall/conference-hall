-- CreateTable
CREATE TABLE "schedule_tracks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_tracks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "schedule_tracks" ADD CONSTRAINT "schedule_tracks_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
