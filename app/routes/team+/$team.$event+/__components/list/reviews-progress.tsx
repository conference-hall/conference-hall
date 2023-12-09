import { ProgressBar } from '~/design-system/ProgressBar';
import { Text } from '~/design-system/Typography';

type ReviewProgressProps = {
  reviewed: number;
  total: number;
};

export function ReviewsProgress({ total, reviewed }: ReviewProgressProps) {
  const progress = total > 0 ? Math.round((reviewed / total) * 100) : 0;
  return (
    <div className="hidden sm:flex sm:flex-col sm:items-start sm:gap-0.5">
      <Text variant="secondary" weight="medium" size="xs">
        {`${progress}% proposals reviewed`}
      </Text>
      <ProgressBar value={reviewed} max={total} />
    </div>
  );
}
