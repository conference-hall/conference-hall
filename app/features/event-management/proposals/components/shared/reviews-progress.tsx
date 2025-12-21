import { useTranslation } from 'react-i18next';
import { ProgressBar } from '~/design-system/charts/progress-bar.tsx';
import { Text } from '~/design-system/typography.tsx';

type ReviewProgressProps = {
  reviewed: number;
  total: number;
};

export function ReviewsProgress({ total, reviewed }: ReviewProgressProps) {
  const { t } = useTranslation();
  const progress = total > 0 ? Math.round((reviewed / total) * 100) : 0;

  return (
    <div className="hidden flex-col items-start gap-0.5 sm:flex">
      <Text variant="secondary" weight="medium" size="s">
        {t('event-management.proposals.review-progress', { progress })}
      </Text>
      <ProgressBar value={reviewed} max={total} />
    </div>
  );
}
