import { EyeSlashIcon } from '@heroicons/react/24/outline';
import { AvatarName } from '~/design-system/avatar.tsx';
import { ProgressBar } from '~/design-system/charts/progress-bar.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Tooltip } from '~/design-system/tooltip.tsx';
import { Text } from '~/design-system/typography.tsx';
import { GlobalReviewNote, UserReviewNote } from '~/routes/components/reviews/review-note.tsx';

type Props = {
  proposalsCount: number;
  reviewersMetrics: Array<{
    id: string;
    name: string;
    picture: string;
    reviewsCount: number;
    averageNote: number;
    positiveCount: number;
    negativeCount: number;
  }>;
};

export function ReviewersList({ proposalsCount, reviewersMetrics }: Props) {
  if (reviewersMetrics.length === 0) {
    return <EmptyState label="No reviews yet" icon={EyeSlashIcon} noBorder />;
  }

  return (
    <ul className="space-y-8" aria-label="Reviewers metrics">
      {reviewersMetrics.map((reviewer, index) => {
        const max = proposalsCount;
        const value = reviewer.reviewsCount;
        const safeValue = Math.min(max, Math.max(value, 0));
        const percentage = max ? (safeValue / max) * 100 : safeValue;

        return (
          <li
            key={reviewer.id}
            aria-label={reviewer.name}
            className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-4"
          >
            <div className="sm:w-1/3 flex items-center">
              <Text weight="semibold" variant="secondary" className="w-12">
                #{index + 1}
              </Text>
              <AvatarName name={reviewer.name} picture={reviewer.picture} size="xs" truncate />
            </div>

            <div className="flex items-center gap-4 grow">
              <ProgressBar value={value} max={max} aria-label={`${reviewer.name} reviews progress`} />
              <Text variant="secondary" weight="semibold" className="w-10 text-right">
                {Math.round(percentage)}%
              </Text>
            </div>

            <div className="sm:w-48 flex gap-8 sm:grid sm:grid-cols-3 sm:gap-4">
              <Tooltip text="Negatives count">
                <UserReviewNote feeling="NEGATIVE" note={reviewer.negativeCount} />
              </Tooltip>
              <Tooltip text="Favorites count">
                <UserReviewNote feeling="POSITIVE" note={reviewer.positiveCount} />
              </Tooltip>
              <Tooltip text="Average reviews">
                <GlobalReviewNote feeling="NEUTRAL" note={reviewer.averageNote} />
              </Tooltip>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
