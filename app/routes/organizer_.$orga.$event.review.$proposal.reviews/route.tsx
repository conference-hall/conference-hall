import { json, type LoaderArgs } from '@remix-run/node';
import { AvatarName } from '~/design-system/Avatar';
import { HeartIcon, StarIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Text } from '~/design-system/Typography';
import { formatRating } from '~/utils/ratings';
import { Card } from '~/design-system/layouts/Card';
import { requireSession } from '~/libs/auth/session';
import invariant from 'tiny-invariant';
import { getReviews } from './server/get-reviews.server';
import { useLoaderData } from '@remix-run/react';

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');

  const result = await getReviews(params.event, params.proposal, userId);

  return json(result.reviews);
};

export default function ProposalReviewRoute() {
  const reviews = useLoaderData<typeof loader>();

  return (
    <Card as="ul" className="divide-y divide-gray-200">
      {reviews.map((review) => (
        <li key={review.id} className="flex items-center justify-between p-4">
          <AvatarName picture={review.picture} name={review.name} />
          <div className="flex w-16 items-center justify-between rounded bg-gray-100 px-3 py-1">
            {review.feeling === 'POSITIVE' ? (
              <HeartIcon className="h-4 w-4" />
            ) : review.feeling === 'NEGATIVE' ? (
              <XCircleIcon className="h-4 w-4" />
            ) : (
              <StarIcon className="h-4 w-4" />
            )}
            <Text size="base" heading strong>
              {formatRating(review.rating)}
            </Text>
          </div>
        </li>
      ))}
    </Card>
  );
}
