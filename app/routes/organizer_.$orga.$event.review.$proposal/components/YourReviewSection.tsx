import { Card } from '~/design-system/layouts/Card';
import { RatingButtons } from './RatingButtons';
import type { RatingFeeling } from '@prisma/client';

type Props = { rating: number | null; feeling: RatingFeeling | null };

export function YourReviewSection({ rating, feeling }: Props) {
  return (
    <Card as="section" p={4}>
      <RatingButtons userRating={{ rating, feeling }} />
    </Card>
  );
}
