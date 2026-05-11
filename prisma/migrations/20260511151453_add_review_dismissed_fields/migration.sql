-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "dismissedAt" TIMESTAMP(3),
ADD COLUMN     "dismissedBy" TEXT;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_dismissedBy_fkey" FOREIGN KEY ("dismissedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
