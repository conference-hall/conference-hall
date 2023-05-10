import { HeartIcon, StarIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { H2, Text } from '~/design-system/Typography';
import { Card } from '~/design-system/layouts/Card';
import { formatRating } from '~/utils/ratings';
import { RatingButtons } from './RatingButtons';
import type { RatingFeeling } from '@prisma/client';

type Props = { rating: number | null; feeling: RatingFeeling | null };

export function YourReviewSection({ rating, feeling }: Props) {
  return (
    <Card as="section" p={4} className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <H2 size="base">Your review</H2>
        <div className="flex items-center gap-2 rounded bg-gray-100 px-3 py-1">
          {feeling === 'POSITIVE' ? (
            <HeartIcon className="h-4 w-4" />
          ) : feeling === 'NEGATIVE' ? (
            <XCircleIcon className="h-4 w-4" />
          ) : (
            <StarIcon className="h-4 w-4" />
          )}

          <Text size="base" heading strong>
            {formatRating(rating)}
          </Text>
        </div>
      </div>

      <RatingButtons userRating={{ rating, feeling }} />
    </Card>
  );
}
