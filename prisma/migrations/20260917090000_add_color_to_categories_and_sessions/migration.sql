-- AlterTable
ALTER TABLE "event_categories" ADD COLUMN     "color" TEXT;

-- AlterTable
ALTER TABLE "schedule_sessions" ALTER COLUMN "color" DROP NOT NULL;
