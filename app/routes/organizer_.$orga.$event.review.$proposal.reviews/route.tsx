import { json, type LoaderArgs } from '@remix-run/node';
import { AvatarName } from '~/design-system/Avatar';
import { EyeSlashIcon } from '@heroicons/react/24/outline';
import { Card } from '~/design-system/layouts/Card';
import { requireSession } from '~/libs/auth/session';
import invariant from 'tiny-invariant';
import { getReviews } from './server/get-reviews.server';
import { useLoaderData } from '@remix-run/react';
import { EmptyState } from '~/design-system/layouts/EmptyState';
import { ReviewNote } from '~/shared-components/reviews/ReviewNote';

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');

  const result = await getReviews(params.event, params.proposal, userId);

  return json(result.reviews);
};

export default function ProposalReviewRoute() {
  const reviews = useLoaderData<typeof loader>();

  if (reviews.length === 0) {
    return <EmptyState icon={EyeSlashIcon} label="No reviews yet." />;
  }

  return (
    <ul aria-label="Organizers reviews" className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {reviews.map((review) => (
        <Card as="li" key={review.id} className="flex items-center justify-between p-4">
          <AvatarName size="xs" picture={review.picture} name={review.name} />
          <ReviewNote feeling={review.feeling} rating={review.rating} />
        </Card>
      ))}
    </ul>
  );
}
