import { ProgressBar } from '~/design-system/charts/progress-bar.tsx';
import { Text } from '~/design-system/typography.tsx';

type ReviewProgressProps = {
  reviewed: number;
  total: number;
};

export function ReviewsProgress({ total, reviewed }: ReviewProgressProps) {
  const progress = total > 0 ? Math.round((reviewed / total) * 100) : 0;
  return (
    <div className="flex flex-col items-start gap-0.5">
      <Text variant="secondary" weight="medium" size="s">
        {`${progress}% proposals reviewed`}
      </Text>
      <ProgressBar value={reviewed} max={total} />
    </div>
  );
}
