import { HeartIcon, NoSymbolIcon, StarIcon, UserCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { Text } from '~/shared/design-system/typography.tsx';
import { formatReviewNote } from '~/shared/formatters/reviews.ts';
import type { ReviewFeeling } from '~/shared/types/proposals.types.ts';
import { ClientOnly } from '../../../../shared/design-system/utils/client-only.tsx';

const REVIEWS = {
  NO_OPINION: { icon: NoSymbolIcon, color: '', stroke: '' },
  NEUTRAL: { icon: StarIcon, color: 'fill-yellow-400', stroke: 'text-yellow-400' },
  NEGATIVE: { icon: XCircleIcon, color: '', stroke: '' },
  POSITIVE: { icon: HeartIcon, color: 'fill-red-400', stroke: 'text-red-400' },
};

type Props = { feeling: ReviewFeeling | null; note: number | null; hideEmpty?: boolean };

export function GlobalReviewNote({ feeling, note, hideEmpty }: Props) {
  const { t } = useTranslation();
  const reviewType = feeling || 'NEUTRAL';
  const { icon: Icon, color, stroke } = REVIEWS[reviewType];
  const formattedNote = formatReviewNote(note);
  const label = t(`common.review.type.${reviewType}`);

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
  const reviewType = feeling || 'NEUTRAL';
  const { icon: Icon, color, stroke } = REVIEWS[reviewType];
  const formattedNote = formatReviewNote(note);
  const label = t(`common.review.type.${reviewType}`);

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
