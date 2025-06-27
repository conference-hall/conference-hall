import { HeartIcon } from '@heroicons/react/20/solid';
import { ReviewsMetrics } from '~/.server/event-metrics/reviews-metrics.ts';
import { ProgressCard } from '~/design-system/dashboard/progress-card.tsx';
import { StatisticCard } from '~/design-system/dashboard/statistic-card.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { ReviewCoverage } from '../components/overview-page/reviews-tab/reviews-coverage-analysis.tsx';
import { ReviewsDistributionChart } from '../components/overview-page/reviews-tab/reviews-distribution-chart.tsx';
import type { Route } from './+types/reviews-tab.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);

  const metrics = await ReviewsMetrics.for(userId, params.team, params.event).get();
  return { metrics };
};

export default function ReviewsTabRoute({ loaderData: { metrics } }: Route.ComponentProps) {
  return (
    <div className="px-6 space-y-8">
      <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-4">
        <StatisticCard label="Average Score" stat={metrics.averageNote > 0 ? metrics.averageNote.toFixed(1) : '-'} />
        <StatisticCard label="Median Score" stat={metrics.medianNote > 0 ? metrics.medianNote.toFixed(1) : '-'} />
        <StatisticCard
          label="Favorites count"
          stat={
            <div className="flex items-center space-x-2">
              <span>{metrics.positiveReviews}</span>
              <HeartIcon className="h-8 w-8 text-red-400" aria-hidden="true" />
            </div>
          }
        />
        <ProgressCard label="Proposals reviewed" value={metrics.reviewedProposals} max={metrics.totalProposals} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-2">
        <ReviewsDistributionChart noteDistribution={metrics.noteDistribution} />
        <ReviewCoverage totalProposals={metrics.totalProposals} distributionBalance={metrics.distributionBalance} />
      </div>
    </div>
  );
}
