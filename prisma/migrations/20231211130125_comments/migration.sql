/*
  Warnings:

  - You are about to drop the column `comments` on the `proposals` table. All the data in the column will be lost.
  - You are about to drop the column `comment` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CommentChannel" AS ENUM ('ORGANIZER', 'SPEAKER');

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_userId_fkey";

-- AlterTable
ALTER TABLE "proposals" DROP COLUMN "comments";

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "comment";

-- DropTable
DROP TABLE "messages";

-- DropEnum
DROP TYPE "MessageChannel";

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "channel" "CommentChannel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
