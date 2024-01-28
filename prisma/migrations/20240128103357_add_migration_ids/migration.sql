/*
  Warnings:

  - You are about to drop the column `lat` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lng` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "migrationId" TEXT;

-- AlterTable
ALTER TABLE "event_categories" ADD COLUMN     "migrationId" TEXT;

-- AlterTable
ALTER TABLE "event_formats" ADD COLUMN     "migrationId" TEXT;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "migrationId" TEXT;

-- AlterTable
ALTER TABLE "proposals" ADD COLUMN     "migrationId" TEXT;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "migrationId" TEXT;

-- AlterTable
ALTER TABLE "surveys" ADD COLUMN     "migrationId" TEXT;

-- AlterTable
ALTER TABLE "talks" ADD COLUMN     "migrationId" TEXT;

-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "migrationId" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "lat",
DROP COLUMN "lng",
DROP COLUMN "timezone",
ADD COLUMN     "migrationId" TEXT;
