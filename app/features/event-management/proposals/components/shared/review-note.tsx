import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import type { MarkerOption } from '~/design-system/forms/marker-group.tsx';
import { Text } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';
import { formatReviewNote } from '~/shared/formatters/reviews.ts';
import type { ReviewFeeling } from '~/shared/types/proposals.types.ts';
import { feelingAndNoteToMarker, getMarkerOptionForFeeling, getReviewMarkerOptions } from './review-markers.config.ts';

type ReviewNoteProps = {
  feeling: ReviewFeeling | null;
  note: number | null;
  size?: 'base' | 'xs';
  label?: string;
  raw?: boolean;
  className?: string;
};

export function ReviewNote({ feeling, note, size = 'base', label, raw, className }: ReviewNoteProps) {
  const { t } = useTranslation();
  const reviewFeeling = feeling || 'NEUTRAL';

  let option: MarkerOption | undefined;
  const marker = feelingAndNoteToMarker(reviewFeeling, note);
  if (!raw && marker) {
    option = getReviewMarkerOptions(t).find((o) => o.value === marker);
  } else {
    option = getMarkerOptionForFeeling(reviewFeeling, t);
  }

  const isScored = (!raw && note !== null) || (raw && note !== 0);
  const hideScore = !raw && feeling === 'NO_OPINION';

  const formattedNote = formatReviewNote(note);
  const Icon = option?.icon;
  const iconClass = cx('shrink-0', {
    [option?.fill ?? '']: isScored,
    'fill-white stroke-gray-300': !isScored,
    'size-5': size === 'base',
    'size-4': size === 'xs',
  });
  const ariaLabel = label ? `${label} = ${formattedNote}` : (option?.label ?? '');

  return (
    <ClientOnly fallback={<div />}>
      {() => (
        <div className={cx('flex items-center gap-1', className)} aria-label={ariaLabel}>
          {Icon && <Icon className={iconClass} aria-hidden />}
          {!hideScore ? (
            <Text weight="semibold" variant={isScored ? 'primary' : 'secondary-light'}>
              {formattedNote ?? '–'}
            </Text>
          ) : null}
        </div>
      )}
    </ClientOnly>
  );
}
