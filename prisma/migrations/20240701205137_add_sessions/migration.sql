-- CreateTable
CREATE TABLE "schedule_sessions" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "dayId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_sessions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "schedule_sessions" ADD CONSTRAINT "schedule_sessions_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "schedule_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_sessions" ADD CONSTRAINT "schedule_sessions_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "schedule_tracks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
