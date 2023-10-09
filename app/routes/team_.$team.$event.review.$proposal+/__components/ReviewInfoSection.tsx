import type { ProposalStatus, ReviewFeeling } from '@prisma/client';
import format from 'date-fns/format/index.js';

import { Card } from '~/design-system/layouts/Card.tsx';
import { H2, Text } from '~/design-system/Typography.tsx';
import { ProposalStatusBadge } from '~/routes/__components/proposals/ProposalStatusBadges.tsx';
import { ReviewNote } from '~/routes/__components/reviews/ReviewNote.tsx';
import { ClientOnly } from '~/routes/__components/utils/ClientOnly.tsx';

import { ReviewForm } from './ReviewForm.tsx';

type Props = {
  proposalId: string;
  userReview: {
    note: number | null;
    feeling: ReviewFeeling | null;
    comment: string | null;
  };
  review?: {
    average: number | null;
    positives: number;
    negatives: number;
  };
  status: ProposalStatus;
  comments: string | null;
  submittedAt: string;
  reviewEnabled: boolean;
  nextId?: string;
};

export function ReviewInfoSection({
  proposalId,
  userReview,
  review,
  status,
  comments,
  submittedAt,
  reviewEnabled,
  nextId,
}: Props) {
  return (
    <Card as="section" className="divide-y divide-gray-200">
      {reviewEnabled && (
        <div className="space-y-4 p-6">
          <H2>Your review</H2>
          <ReviewForm key={proposalId} initialValues={userReview} nextId={nextId} />
        </div>
      )}

      <div className="space-y-8 p-6">
        <H2>Review information</H2>
        {review && (
          <div className="flex items-center justify-between">
            <Text weight="medium">Global review</Text>
            <div className="flex gap-4">
              <ReviewNote feeling="NEGATIVE" note={review?.negatives} />
              <ReviewNote feeling="POSITIVE" note={review?.positives} />
              <ReviewNote feeling="NEUTRAL" note={review?.average} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Text weight="medium">Your review</Text>
          <ReviewNote feeling={userReview.feeling} note={userReview.note} />
        </div>

        <div className="flex justify-between gap-2">
          <Text weight="medium">Proposal status</Text>
          <ProposalStatusBadge status={status} />
        </div>

        <div className="flex justify-between gap-2">
          <Text weight="medium">Submission date</Text>
          <ClientOnly>{() => <Text size="s">{format(new Date(submittedAt), 'PPP')}</Text>}</ClientOnly>
        </div>

        {comments && (
          <div className="flex flex-col gap-2">
            <Text weight="medium">Submission message</Text>
            <div className="rounded bg-gray-50 p-4">
              <Text>{comments}</Text>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
