-- AlterTable
ALTER TABLE "schedule_sessions" ADD COLUMN     "proposalId" TEXT;

-- AddForeignKey
ALTER TABLE "schedule_sessions" ADD CONSTRAINT "schedule_sessions_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
