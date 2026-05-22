-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_proposalId_fkey";

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
