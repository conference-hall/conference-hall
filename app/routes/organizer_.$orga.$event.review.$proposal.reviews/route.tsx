import { json, type LoaderArgs } from '@remix-run/node';
import { AvatarName } from '~/design-system/Avatar';
import { EyeSlashIcon, HeartIcon, StarIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Text } from '~/design-system/Typography';
import { formatRating } from '~/utils/ratings';
import { Card } from '~/design-system/layouts/Card';
import { requireSession } from '~/libs/auth/session';
import invariant from 'tiny-invariant';
import { getReviews } from './server/get-reviews.server';
import { useLoaderData } from '@remix-run/react';
import { EmptyState } from '~/design-system/layouts/EmptyState';

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
          <div className="flex items-center gap-1">
            {review.feeling === 'POSITIVE' ? (
              <HeartIcon className="h-4 w-4 fill-red-300" />
            ) : review.feeling === 'NEGATIVE' ? (
              <XCircleIcon className="h-4 w-4 fill-gray-100" />
            ) : (
              <StarIcon className="h-4 w-4 fill-yellow-300" />
            )}

            <Text size="s" strong>
              {formatRating(review.rating)}
            </Text>
          </div>
        </Card>
      ))}
    </ul>
  );
}
