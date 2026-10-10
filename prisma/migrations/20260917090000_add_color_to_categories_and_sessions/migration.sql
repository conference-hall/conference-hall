-- AlterTable
ALTER TABLE "event_categories" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#9CA3AF';

-- AlterTable
ALTER TABLE "event_formats" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#9CA3AF';

-- AlterTable
ALTER TABLE "schedule_sessions" ALTER COLUMN "color" DROP NOT NULL;
