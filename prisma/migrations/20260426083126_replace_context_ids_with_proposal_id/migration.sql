/*
  Warnings:

  - You are about to drop the column `contextIds` on the `conversations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "contextIds",
ADD COLUMN     "proposalId" TEXT;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
