/*
  Warnings:

  - You are about to drop the column `contextIds` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `contextType` on the `conversations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[proposalId,type]` on the table `conversations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `proposalId` to the `conversations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `conversations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('PROPOSAL_SPEAKER_CONVERSATION', 'PROPOSAL_REVIEW_COMMENTS');

-- DropIndex
DROP INDEX "conversations_eventId_idx";

-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "contextIds",
DROP COLUMN "contextType",
ADD COLUMN     "proposalId" TEXT NOT NULL,
ADD COLUMN     "type" "ConversationType" NOT NULL;

-- DropEnum
DROP TYPE "ConversationContextType";

-- CreateIndex
CREATE INDEX "conversation_messages_conversationId_createdAt_idx" ON "conversation_messages"("conversationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_proposalId_type_key" ON "conversations"("proposalId", "type");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
