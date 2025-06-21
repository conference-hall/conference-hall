import { useTranslation } from 'react-i18next';
import { EventMetrics } from '~/.server/event-metrics/event-metrics.ts';
import { ReviewersMetrics } from '~/.server/event-metrics/reviewers-metrics.ts';
import { BarListCard } from '~/design-system/dashboard/bar-list-card.tsx';
import { ProgressCard } from '~/design-system/dashboard/progress-card.tsx';
import { StatisticCard } from '~/design-system/dashboard/statistic-card.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context.tsx';
import { useCurrentTeam } from '~/routes/components/contexts/team-context.tsx';
import type { Route } from './+types/overview.ts';
import { CfpStatusCard } from './components/overview-page/cfp-status-card.tsx';
import { DashboardTabs } from './components/overview-page/dashboard-tabs.tsx';
import { ProposalsByDayChart } from './components/overview-page/proposals-by-days-chart.tsx';
import { ReviewStatusCard } from './components/overview-page/review-status-card.tsx';
import { ReviewersList } from './components/overview-page/reviewers-list.tsx';
import { VisibilityStatusCard } from './components/overview-page/visibility-status-card.tsx';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const { searchParams } = new URL(request.url);

  if (searchParams.get('tab') === 'reviewers') {
    const metrics = await ReviewersMetrics.for(userId, params.team, params.event).get();
    return { tab: 'reviewers', metrics } as const;
  } else {
    const metrics = await EventMetrics.for(userId, params.team, params.event).get();
    return { tab: 'call-for-paper', metrics } as const;
  }
};

export default function OverviewRoute({ loaderData: { tab, metrics } }: Route.ComponentProps) {
  const { t } = useTranslation();
  const currentTeam = useCurrentTeam();
  const currentEvent = useCurrentEvent();
  const { canEditEvent } = currentTeam.userPermissions;

  return (
    <Page>
      <h1 className="sr-only">{t('event-management.overview.heading')}</h1>
      <div className="space-y-4 lg:space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-3">
          <CfpStatusCard
            cfpState={currentEvent.cfpState}
            cfpStart={currentEvent.cfpStart}
            cfpEnd={currentEvent.cfpEnd}
            timezone={currentEvent.timezone}
            showActions={canEditEvent}
          />

          <VisibilityStatusCard visibility={currentEvent.visibility} showActions={canEditEvent} />

          <ReviewStatusCard reviewEnabled={currentEvent.reviewEnabled} showActions={canEditEvent} />
        </div>

        <div>
          <Card className="pb-6 space-y-8">
            <DashboardTabs tab={tab} team={currentTeam.slug} event={currentEvent.slug} />

            {tab === 'call-for-paper' ? (
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
                    <BarListCard
                      label={t('event-management.overview.proposals-by-categories')}
                      data={metrics.byCategories}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="px-6 space-y-8">
                <ReviewersList proposalsCount={metrics.proposalsCount} reviewersMetrics={metrics.reviewersMetrics} />
              </div>
            )}
          </Card>
        </div>
      </div>
    </Page>
  );
}
