-- AlterTable
ALTER TABLE "schedule_sessions" ADD COLUMN     "emojis" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "language" TEXT;
