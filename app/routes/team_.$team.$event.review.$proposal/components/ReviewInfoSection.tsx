import type { ProposalStatus, ReviewFeeling } from '@prisma/client';
import format from 'date-fns/format';
import { ClientOnly } from 'remix-utils';
import { H2, Text } from '~/design-system/Typography';
import { Card } from '~/design-system/layouts/Card';
import { ProposalStatusBadge } from '~/components/proposals/ProposalStatusBadges';
import { ReviewNote } from '~/components/reviews/ReviewNote';
import { ReviewForm } from './ReviewForm';

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
};

export function ReviewInfoSection({
  proposalId,
  userReview,
  review,
  status,
  comments,
  submittedAt,
  reviewEnabled,
}: Props) {
  return (
    <Card as="section" className="divide-y divide-gray-200">
      {reviewEnabled && (
        <div className="space-y-4 p-6">
          <H2 size="base">Your review</H2>
          <ReviewForm key={proposalId} initialValues={userReview} />
        </div>
      )}

      <div className="space-y-8 p-6">
        <H2 size="base">Review information</H2>
        {review && (
          <div className="flex items-center justify-between">
            <Text size="s" strong>
              Global review
            </Text>
            <div className="flex gap-4">
              <ReviewNote feeling="NEGATIVE" note={review?.negatives} />
              <ReviewNote feeling="POSITIVE" note={review?.positives} />
              <ReviewNote feeling="NEUTRAL" note={review?.average} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Text size="s" strong>
            Your review
          </Text>
          <ReviewNote feeling={userReview.feeling} note={userReview.note} />
        </div>

        <div className="flex justify-between gap-2">
          <Text size="s" strong>
            Proposal status
          </Text>
          <ProposalStatusBadge status={status} />
        </div>

        <div className="flex justify-between gap-2">
          <Text size="s" strong>
            Submission date
          </Text>
          <ClientOnly>{() => <Text size="s">{format(new Date(submittedAt), 'PPP')}</Text>}</ClientOnly>
        </div>

        {comments && (
          <div className="flex flex-col gap-2">
            <Text size="s" strong>
              Submission message
            </Text>
            <div className="rounded bg-gray-50 p-4">
              <Text size="s">{comments}</Text>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
