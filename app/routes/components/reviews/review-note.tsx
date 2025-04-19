import { HeartIcon, NoSymbolIcon, StarIcon, UserCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { Text } from '~/design-system/typography.tsx';
import { formatReviewNote } from '~/libs/formatters/reviews.ts';
import { ClientOnly } from '../utils/client-only.tsx';

// todo(i18n)
const REVIEWS = {
  NO_OPINION: { icon: NoSymbolIcon, color: '', stroke: '', label: 'No opinion' },
  NEUTRAL: { icon: StarIcon, color: 'fill-yellow-400', stroke: 'text-yellow-400', label: 'Score' },
  NEGATIVE: { icon: XCircleIcon, color: '', stroke: '', label: 'No way' },
  POSITIVE: { icon: HeartIcon, color: 'fill-red-400', stroke: 'text-red-400', label: 'Love it' },
};

type Props = { feeling: keyof typeof REVIEWS | null; note: number | null; hideEmpty?: boolean };

export function GlobalReviewNote({ feeling, note, hideEmpty }: Props) {
  const { t } = useTranslation();
  const { icon: Icon, color, stroke, label } = REVIEWS[feeling || 'NEUTRAL'];
  const formattedNote = formatReviewNote(note);

  if (note === null && feeling !== 'NO_OPINION') return <div />;

  return (
    <div className={cx('flex items-center justify-end gap-1', { invisible: note === null && hideEmpty })}>
      <ClientOnly>
        {() => (
          <>
            <Text weight="semibold" variant="secondary">
              {formattedNote}
            </Text>
            <Icon
              className={cx('size-5 shrink-0', color, stroke)}
              aria-label={t('common.review.detail', { note: formattedNote, label })}
            />
          </>
        )}
      </ClientOnly>
    </div>
  );
}

export function UserReviewNote({ feeling, note }: Props) {
  const { t } = useTranslation();
  const { icon: Icon, color, stroke, label } = REVIEWS[feeling || 'NEUTRAL'];
  const formattedNote = formatReviewNote(note);

  if (note === null && feeling !== 'NO_OPINION') return <div />;

  return (
    <div className="flex items-center justify-end gap-1">
      <ClientOnly>
        {() => (
          <>
            <Text weight="semibold" variant="secondary">
              {formattedNote}
            </Text>
            {feeling === 'NEUTRAL' ? (
              <UserCircleIcon
                className="size-5 text-gray-700 shrink-0"
                aria-label={t('common.review.user', { note: formattedNote })}
              />
            ) : (
              <Icon
                className={cx('size-5 shrink-0', color, stroke)}
                aria-label={t('common.review.detail', { note: formattedNote, label })}
              />
            )}
          </>
        )}
      </ClientOnly>
    </div>
  );
}
