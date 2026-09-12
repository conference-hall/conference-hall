-- AlterTable
ALTER TABLE "proposals" ADD COLUMN     "slidesUrl" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "talks" ADD COLUMN     "slidesUrl" TEXT,
ADD COLUMN     "videoUrl" TEXT;
