import type { ConfirmationStatus, DeliberationStatus, GlobalReview, UserReview } from '~/types/proposals.types';

export type ProposalData = {
  id: string;
  title: string;
  deliberationStatus: DeliberationStatus;
  confirmationStatus: ConfirmationStatus | null;
  speakers: Array<{ name: string | null; picture: string | null }>;
  reviews: { summary?: GlobalReview; you: UserReview };
};
