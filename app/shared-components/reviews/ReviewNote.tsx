import c from 'classnames';
import { HeartIcon, NoSymbolIcon, StarIcon, UserIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Text } from '~/design-system/Typography';
import { formatRating } from '~/utils/ratings';

const REVIEWS = {
  NO_OPINION: { icon: NoSymbolIcon, color: 'fill-red-100', label: 'No opinion' },
  NEUTRAL: { icon: StarIcon, color: 'fill-yellow-300', label: 'Score' },
  NEGATIVE: { icon: XCircleIcon, color: 'fill-gray-100', label: 'No way' },
  POSITIVE: { icon: HeartIcon, color: 'fill-red-300', label: 'Love it' },
  USER: { icon: UserIcon, color: 'fill-gray-300', label: 'Your review' },
};

type Props = { feeling: keyof typeof REVIEWS | null; rating: number | null };

export function ReviewNote({ feeling, rating }: Props) {
  const { icon: Icon, color, label } = REVIEWS[feeling || 'NEUTRAL'];
  const rate = formatRating(rating);
  return (
    <div className="flex items-center gap-1">
      <Icon className={c('h-4 w-4', color)} aria-label={`${label}: ${rate}`} />
      <Text size="s" strong>
        {rate}
      </Text>
    </div>
  );
}
