-- AlterTable
ALTER TABLE "_proposal_to_event_proposal_tags" ADD CONSTRAINT "_proposal_to_event_proposal_tags_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_proposal_to_event_proposal_tags_AB_unique";

-- AlterTable
ALTER TABLE "_proposals_categories" ADD CONSTRAINT "_proposals_categories_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_proposals_categories_AB_unique";

-- AlterTable
ALTER TABLE "_proposals_formats" ADD CONSTRAINT "_proposals_formats_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_proposals_formats_AB_unique";

-- AlterTable
ALTER TABLE "_speakers_proposals" ADD CONSTRAINT "_speakers_proposals_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_speakers_proposals_AB_unique";

-- AlterTable
ALTER TABLE "_speakers_talks" ADD CONSTRAINT "_speakers_talks_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_speakers_talks_AB_unique";
