-- AlterTable
ALTER TABLE "event_formats" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#F3F4F6';

-- AlterTable
ALTER TABLE "event_categories" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#F3F4F6';

-- AlterTable
ALTER TABLE "schedule_sessions" ALTER COLUMN "color" DROP NOT NULL;

