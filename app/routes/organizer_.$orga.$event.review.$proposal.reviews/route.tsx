import type { LoaderArgs } from '@remix-run/node';
import { useProposalReview } from '../organizer_.$orga.$event.review.$proposal/route';
import { AvatarName } from '~/design-system/Avatar';
import { HeartIcon, StarIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Text } from '~/design-system/Typography';
import { formatRating } from '~/utils/ratings';
import { Card } from '~/design-system/layouts/Card';

export const loader = async ({ request }: LoaderArgs) => {
  return null;
};

export default function ProposalReviewRoute() {
  const { proposalReview } = useProposalReview();

  return (
    <Card as="ul" className="divide-y divide-gray-200">
      {proposalReview.proposal.ratings.members.map((member) => (
        <li key={member.id} className="flex items-center justify-between p-4">
          <AvatarName picture={member.picture} name={member.name} />
          <div className="flex w-16 items-center justify-between rounded bg-gray-100 px-3 py-1">
            {member.feeling === 'POSITIVE' ? (
              <HeartIcon className="h-4 w-4" />
            ) : member.feeling === 'NEGATIVE' ? (
              <XCircleIcon className="h-4 w-4" />
            ) : (
              <StarIcon className="h-4 w-4" />
            )}
            <Text size="base" heading strong>
              {formatRating(member.rating)}
            </Text>
          </div>
        </li>
      ))}
    </Card>
  );
}
