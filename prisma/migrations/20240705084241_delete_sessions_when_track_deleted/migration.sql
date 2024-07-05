-- DropForeignKey
ALTER TABLE "schedule_sessions" DROP CONSTRAINT "schedule_sessions_trackId_fkey";

-- AddForeignKey
ALTER TABLE "schedule_sessions" ADD CONSTRAINT "schedule_sessions_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "schedule_tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
