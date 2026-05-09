import { UserCircleIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import type { MarkerOption } from '~/design-system/forms/marker-group.tsx';
import { Text } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';
import { formatReviewNote } from '~/shared/formatters/reviews.ts';
import type { ReviewFeeling } from '~/shared/types/proposals.types.ts';
import { feelingAndNoteToMarker, getMarkerOptionForFeeling, getReviewMarkerOptions } from '../review-markers.config.ts';

type ReviewNoteProps = {
  feeling: ReviewFeeling | null;
  note: number | null;
  variant?: 'global' | 'user';
  hideEmpty?: boolean;
  raw?: boolean;
};

export function ReviewNote({ feeling, note, variant = 'global', hideEmpty, raw }: ReviewNoteProps) {
  const { t } = useTranslation();
  const reviewFeeling = feeling || 'NEUTRAL';

  let option: MarkerOption | undefined;
  const marker = feelingAndNoteToMarker(reviewFeeling, note);
  if (!raw && marker) {
    option = getReviewMarkerOptions(t).find((o) => o.value === marker);
  } else {
    option = getMarkerOptionForFeeling(reviewFeeling, t);
  }

  if (note === null && feeling !== 'NO_OPINION') return <div />;

  const formattedNote = formatReviewNote(note);
  const isUserNeutral = variant === 'user' && reviewFeeling === 'NEUTRAL';
  const Icon = isUserNeutral ? UserCircleIcon : option?.icon;
  const iconClass = isUserNeutral ? 'size-5 shrink-0 text-gray-700' : cx('size-5 shrink-0', option?.fill);

  return (
    <div className={cx('flex items-center justify-end gap-1', { invisible: note === null && hideEmpty })}>
      <ClientOnly>
        {() => (
          <>
            <Text weight="semibold" variant="secondary">
              {formattedNote}
            </Text>
            {Icon && <Icon className={iconClass} aria-label={option?.label ?? ''} />}
          </>
        )}
      </ClientOnly>
    </div>
  );
}
