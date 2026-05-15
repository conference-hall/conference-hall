import { Trans } from 'react-i18next';
import { ProgressBar } from '~/design-system/charts/progress-bar.tsx';
import { Text } from '~/design-system/typography.tsx';

type ReviewProgressProps = {
  reviewed: number;
  total: number;
};

export function ReviewsProgress({ total, reviewed }: ReviewProgressProps) {
  const progress = total > 0 ? Math.round((reviewed / total) * 100) : 0;

  return (
    <div className="hidden gap-3 sm:flex sm:items-center">
      <Text variant="secondary" size="xs" className="whitespace-nowrap">
        <Trans
          i18nKey="event-management.proposals.review-progress"
          values={{ progress }}
          components={[<span key="0" className="font-semibold text-gray-800" />]}
        />
      </Text>
      <ProgressBar value={reviewed} max={total} className="min-w-32" />
    </div>
  );
}
