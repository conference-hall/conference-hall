import { HeartIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { ReviewsMetrics } from '~/.server/event-metrics/reviews-metrics.ts';
import { ProgressCard } from '~/design-system/dashboard/progress-card.tsx';
import { StatisticCard } from '~/design-system/dashboard/statistic-card.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { ProposalNotesDistribution } from '../components/overview-page/reviews-tab/proposal-notes-distribution.tsx';
import { ReviewCountDistribution } from '../components/overview-page/reviews-tab/review-count-distribution.tsx';
import type { Route } from './+types/reviews-tab.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);

  const enabledForTeam = await flags.get('reviewsDashboard');
  if (enabledForTeam !== params.team) {
    throw new Response('Not found', { status: 404 });
  }

  const metrics = await ReviewsMetrics.for(userId, params.team, params.event).get();
  return { metrics };
};

export default function ReviewsTabRoute({ loaderData: { metrics } }: Route.ComponentProps) {
  const { t } = useTranslation();

  return (
    <div className="px-6 space-y-8">
      <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-3">
        <StatisticCard
          label={t('event-management.overview.reviews.global-average-score')}
          stat={metrics.averageNote > 0 ? metrics.averageNote.toFixed(1) : '-'}
        />
        <StatisticCard
          label={t('event-management.overview.reviews.favorites-count')}
          stat={
            <div className="flex items-center space-x-2">
              <span>{metrics.positiveReviews}</span>
              <HeartIcon className="h-7 w-7 text-red-400" aria-hidden="true" />
            </div>
          }
        />
        <ProgressCard
          label={t('event-management.overview.reviews.proposals-reviewed')}
          value={metrics.reviewedProposals}
          max={metrics.totalProposals}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-2">
        <ProposalNotesDistribution proposalNotesDistribution={metrics.proposalNotesDistribution} />

        <ReviewCountDistribution
          totalProposals={metrics.totalProposals}
          reviewCountDistribution={metrics.reviewCountDistribution}
        />
      </div>
    </div>
  );
}
