/*
  Warnings:

  - You are about to drop the `_speakers_proposals` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_speakers_proposals" DROP CONSTRAINT "_speakers_proposals_A_fkey";

-- DropForeignKey
ALTER TABLE "_speakers_proposals" DROP CONSTRAINT "_speakers_proposals_B_fkey";

-- DropTable
DROP TABLE "_speakers_proposals";
