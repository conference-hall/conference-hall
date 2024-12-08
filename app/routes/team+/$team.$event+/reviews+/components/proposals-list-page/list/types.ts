import type {
  ConfirmationStatus,
  DeliberationStatus,
  GlobalReview,
  PublicationStatus,
  UserReview,
} from '~/types/proposals.types';
import type { Tag } from '~/types/tags.types.ts';

export type ProposalData = {
  id: string;
  title: string;
  deliberationStatus: DeliberationStatus;
  publicationStatus: PublicationStatus;
  confirmationStatus: ConfirmationStatus | null;
  createdAt: Date;
  speakers: Array<{ name: string | null; picture: string | null }>;
  reviews: { summary?: GlobalReview; you: UserReview };
  comments: { count: number };
  tags: Array<Tag>;
};