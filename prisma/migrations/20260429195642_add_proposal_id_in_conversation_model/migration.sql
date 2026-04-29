/*
  Warnings:

  - You are about to drop the column `contextIds` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `contextType` on the `conversations` table. All the data in the column will be lost.
  - Added the required column `type` to the `conversations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('PROPOSAL_SPEAKER_CONVERSATION', 'PROPOSAL_REVIEW_COMMENTS');

-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "contextIds",
DROP COLUMN "contextType",
ADD COLUMN     "proposalId" TEXT,
ADD COLUMN     "type" "ConversationType" NOT NULL;

-- DropEnum
DROP TYPE "ConversationContextType";

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
