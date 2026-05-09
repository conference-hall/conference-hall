import { EyeSlashIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { AvatarName } from '~/design-system/avatar.tsx';
import { ProgressBar } from '~/design-system/charts/progress-bar.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Tooltip } from '~/design-system/tooltip.tsx';
import { Text } from '~/design-system/typography.tsx';
import { ReviewNote } from '~/features/event-management/proposals/components/shared/review-note.tsx';
import { AuthorizedEventContext } from '~/shared/authorization/authorization.middleware.ts';
import type { Route } from './+types/overview.reviewers.ts';
import { ReviewersMetrics } from './services/reviewers-metrics.server.ts';

export const loader = async ({ context }: Route.LoaderArgs) => {
  const authorizedEvent = context.get(AuthorizedEventContext);
  const metrics = await ReviewersMetrics.for(authorizedEvent).get();
  return { metrics };
};

export default function ReviewersTabRoute({ loaderData: { metrics } }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { reviewersMetrics, proposalsCount } = metrics;

  if (reviewersMetrics.length === 0) {
    return <EmptyState label={t('event-management.overview.reviewers.empty')} icon={EyeSlashIcon} noBorder />;
  }

  return (
    <ul className="space-y-8 px-6" aria-label={t('event-management.overview.reviewers.heading')}>
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
            <div className="flex items-center sm:w-1/3">
              <Text weight="semibold" variant="secondary" className="w-12">
                #{index + 1}
              </Text>
              <AvatarName name={reviewer.name} picture={reviewer.picture} size="xs" truncate />
            </div>

            <div className="flex grow items-center gap-4">
              <ProgressBar
                value={value}
                max={max}
                aria-label={t('event-management.overview.reviewers.progress', { name: reviewer.name })}
              />
              <Text variant="secondary" weight="semibold" className="w-10 text-right">
                {Math.round(percentage)}%
              </Text>
            </div>

            <div className="flex gap-8 sm:grid sm:w-48 sm:grid-cols-3 sm:gap-4">
              <Tooltip text={t('event-management.overview.reviewers.negatives-count')}>
                <ReviewNote feeling="NEGATIVE" note={reviewer.negativeCount} raw />
              </Tooltip>
              <Tooltip text={t('event-management.overview.reviewers.favorites-count')}>
                <ReviewNote feeling="POSITIVE" note={reviewer.positiveCount} raw />
              </Tooltip>
              <Tooltip text={t('event-management.overview.reviewers.average-reviews')}>
                <ReviewNote feeling="NEUTRAL" note={reviewer.averageNote} raw />
              </Tooltip>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
