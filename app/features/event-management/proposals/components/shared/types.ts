import type {
  ConfirmationStatus,
  DeliberationStatus,
  GlobalReview,
  PublicationStatus,
  UserReview,
} from '~/shared/types/proposals.types.ts';
import type { Tag } from '~/shared/types/tags.types.ts';

export type ProposalData = {
  id: string;
  proposalNumber: number | null;
  title: string;
  deliberationStatus: DeliberationStatus;
  publicationStatus: PublicationStatus;
  confirmationStatus: ConfirmationStatus | null;
  archivedAt: Date | null;
  submittedAt: Date;
  speakers: Array<{ name: string | null }>;
  reviews: { summary?: GlobalReview; you: UserReview };
  comments: { count: number };
  tags: Array<Tag>;
};
