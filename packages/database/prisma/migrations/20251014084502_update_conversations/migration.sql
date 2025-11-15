/*
  Warnings:

  - The values [EVENT,PROPOSAL] on the enum `ConversationContextType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ConversationContextType_new" AS ENUM ('EVENT_CONVERSATION', 'PROPOSAL_CONVERSATION', 'PROPOSAL_REVIEW_COMMENTS');
ALTER TABLE "public"."conversations" ALTER COLUMN "contextType" TYPE "public"."ConversationContextType_new" USING ("contextType"::text::"public"."ConversationContextType_new");
ALTER TYPE "public"."ConversationContextType" RENAME TO "ConversationContextType_old";
ALTER TYPE "public"."ConversationContextType_new" RENAME TO "ConversationContextType";
DROP TYPE "public"."ConversationContextType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."conversation_reactions" ADD COLUMN     "reactedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
