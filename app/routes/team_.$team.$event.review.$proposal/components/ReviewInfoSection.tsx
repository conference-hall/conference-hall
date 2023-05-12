import type { ProposalStatus, RatingFeeling } from '@prisma/client';
import format from 'date-fns/format';
import { ClientOnly } from 'remix-utils';
import { H2, Text } from '~/design-system/Typography';
import { Card } from '~/design-system/layouts/Card';
import { ProposalStatusBadge } from '~/shared-components/proposals/ProposalStatusBadges';
import { ReviewNote } from '~/shared-components/reviews/ReviewNote';
import { ReviewForm } from './ReviewForm';

type Props = {
  proposalId: string;
  userReview: {
    rating: number | null;
    feeling: RatingFeeling | null;
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
  deliberationEnabled: boolean;
};

export function ReviewInfoSection({
  proposalId,
  userReview,
  review,
  status,
  comments,
  submittedAt,
  deliberationEnabled,
}: Props) {
  return (
    <Card as="section" className="divide-y divide-gray-200">
      {deliberationEnabled && (
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
              <ReviewNote feeling="NEGATIVE" rating={review?.negatives} />
              <ReviewNote feeling="POSITIVE" rating={review?.positives} />
              <ReviewNote feeling="NEUTRAL" rating={review?.average} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Text size="s" strong>
            Your review
          </Text>
          <ReviewNote feeling={userReview.feeling} rating={userReview.rating} />
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
