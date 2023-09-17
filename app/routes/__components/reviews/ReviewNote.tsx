import { HeartIcon, NoSymbolIcon, StarIcon, UserIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';

import { Text } from '~/design-system/Typography.tsx';
import { formatReviewNote } from '~/utils/reviews.ts';

const REVIEWS = {
  NO_OPINION: { icon: NoSymbolIcon, color: 'fill-red-100', label: 'No opinion' },
  NEUTRAL: { icon: StarIcon, color: 'fill-yellow-300', label: 'Score' },
  NEGATIVE: { icon: XCircleIcon, color: 'fill-gray-100', label: 'No way' },
  POSITIVE: { icon: HeartIcon, color: 'fill-red-300', label: 'Love it' },
  USER: { icon: UserIcon, color: 'fill-gray-300', label: 'Your review' },
};

type Props = { feeling: keyof typeof REVIEWS | null; note: number | null };

export function ReviewNote({ feeling, note }: Props) {
  const { icon: Icon, color, label } = REVIEWS[feeling || 'NEUTRAL'];
  const formattedNote = formatReviewNote(note);
  return (
    <div className="flex items-center gap-1">
      <Icon className={cx('h-4 w-4', color)} aria-label={`${label}: ${formattedNote}`} />
      <Text strong>{formattedNote}</Text>
    </div>
  );
}
