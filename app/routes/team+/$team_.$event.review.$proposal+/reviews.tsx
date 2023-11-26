import { EyeSlashIcon } from '@heroicons/react/24/outline';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { AvatarName } from '~/design-system/Avatar.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { EmptyState } from '~/design-system/layouts/EmptyState.tsx';
import { Subtitle } from '~/design-system/Typography.tsx';
import { ProposalReview } from '~/domains/organizer-cfp-reviews/ProposalReview.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { ReviewNote } from '~/routes/__components/reviews/ReviewNote.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.team, 'Invalid team slug');
  invariant(params.proposal, 'Invalid proposal id');

  const review = ProposalReview.for(userId, params.team, params.event, params.proposal);
  const reviews = await review.getTeamReviews();

  return json(reviews);
};

export default function ProposalReviewRoute() {
  const reviews = useLoaderData<typeof loader>();

  if (reviews.length === 0) {
    return <EmptyState icon={EyeSlashIcon} label="No reviews yet." />;
  }

  return (
    <ul aria-label="Organizers reviews" className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {reviews.map((review) => (
        <Card as="li" key={review.id} className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <AvatarName size="xs" picture={review.picture} name={review.name} />
            <ReviewNote feeling={review.feeling} note={review.note} />
          </div>
          <Subtitle>{review.comment ?? 'No comment.'}</Subtitle>
        </Card>
      ))}
    </ul>
  );
}
