import { HeartIcon, NoSymbolIcon, StarIcon, UserCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';

import { Text } from '~/design-system/Typography.tsx';
import { formatReviewNote } from '~/libs/formatters/reviews';

const REVIEWS = {
  NO_OPINION: { icon: NoSymbolIcon, color: '', stroke: '', label: 'No opinion' },
  NEUTRAL: { icon: StarIcon, color: 'fill-yellow-400', stroke: 'text-yellow-400', label: 'Score' },
  NEGATIVE: { icon: XCircleIcon, color: '', stroke: '', label: 'No way' },
  POSITIVE: { icon: HeartIcon, color: 'fill-red-400', stroke: 'text-red-400', label: 'Love it' },
};

type Props = { feeling: keyof typeof REVIEWS | null; note: number | null; hideEmpty?: boolean };

export function GlobalReviewNote({ feeling, note, hideEmpty }: Props) {
  const { icon: Icon, color, stroke, label } = REVIEWS[feeling || 'NEUTRAL'];
  const formattedNote = formatReviewNote(note);
  return (
    <div className={cx('flex items-center justify-end gap-1', { invisible: note === null && hideEmpty })}>
      <Text weight="semibold" variant="secondary">
        {formattedNote}
      </Text>
      <Icon className={cx('h-5 w-5', color, stroke)} aria-label={`${label}: ${formattedNote}`} />
    </div>
  );
}

export function UserReviewNote({ feeling, note }: Props) {
  if (!feeling) return null;

  const { icon: Icon, color, stroke, label } = REVIEWS[feeling];
  const formattedNote = formatReviewNote(note);

  if (feeling === 'POSITIVE' || feeling === 'NEGATIVE' || feeling === 'NO_OPINION') {
    return <Icon className={cx('h-5 w-5', color, stroke)} aria-label={`Your review: ${label}`} />;
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Text weight="semibold" variant="secondary">
        {formattedNote}
      </Text>
      <UserCircleIcon className="h-5 w-5 text-gray-700" aria-label={`Your review: ${formattedNote}`} />
    </div>
  );
}
