import { useTranslation } from 'react-i18next';
import { EventMetrics } from '~/.server/event-metrics/event-metrics.ts';
import { BarListCard } from '~/design-system/dashboard/bar-list-card.tsx';
import { ProgressCard } from '~/design-system/dashboard/progress-card.tsx';
import { StatisticCard } from '~/design-system/dashboard/statistic-card.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { ProposalsByDayChart } from '../components/overview-page/proposals-by-days-chart.tsx';
import type { Route } from './+types/cfp-tab.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);

  //todo: separate global metrics and cfp metrics
  const metrics = await EventMetrics.for(userId, params.team, params.event).get();
  return { metrics };
};

export default function CFPTabRoute({ loaderData: { metrics } }: Route.ComponentProps) {
  const { t } = useTranslation();

  return (
    <div className="px-6 space-y-8">
      <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-3">
        <StatisticCard label={t('common.proposals')} stat={`${metrics.proposalsCount}`} />
        <StatisticCard label={t('common.speakers')} stat={`${metrics.speakersCount}`} />
        <ProgressCard
          label={t('event-management.overview.reviewed-by-you')}
          value={metrics.reviewsCount}
          max={metrics.proposalsCount}
        />
      </div>

      <ProposalsByDayChart data={metrics.byDays} className="p-6 space-y-6" />

      <div className="grid grid-cols-1 gap-4 lg:gap-6 sm:grid-cols-2">
        {metrics.byFormats && (
          <BarListCard label={t('event-management.overview.proposals-by-formats')} data={metrics.byFormats} />
        )}
        {metrics.byCategories && (
          <BarListCard label={t('event-management.overview.proposals-by-categories')} data={metrics.byCategories} />
        )}
      </div>
    </div>
  );
}
