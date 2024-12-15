import { useState } from 'react';
import { EventMetrics } from '~/.server/event-metrics/event-metrics.ts';
import { BarListCard } from '~/design-system/dashboard/bar-list-card.tsx';
import { ProgressCard } from '~/design-system/dashboard/progress-card.tsx';
import { StatisticCard } from '~/design-system/dashboard/statistic-card.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context.tsx';
import { useCurrentTeam } from '~/routes/components/contexts/team-context.tsx';
import { SponsorLink } from '~/routes/components/sponsor-link.tsx';
import type { Route } from './+types/index.ts';
import { CfpStatusCard } from './components/overview-page/cfp-status-card.tsx';
import { ChartSelector } from './components/overview-page/charts-selector.tsx';
import type { ChartType } from './components/overview-page/proposals-by-days-chart.tsx';
import { ProposalsByDayChart } from './components/overview-page/proposals-by-days-chart.tsx';
import { ReviewStatusCard } from './components/overview-page/review-status-card.tsx';
import { VisibilityStatusCard } from './components/overview-page/visibility-status-card.tsx';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const userId = await requireSession(request);
  return EventMetrics.for(userId, params.team, params.event).globalMetrics();
};

export default function OverviewRoute({ loaderData: metrics }: Route.ComponentProps) {
  const currentTeam = useCurrentTeam();
  const currentEvent = useCurrentEvent();
  const { canEditEvent } = currentTeam.userPermissions;
  const [chartSelected, setChartSelected] = useState<ChartType>('cumulative');

  return (
    <Page>
      <h1 className="sr-only">Event overview</h1>
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
          <Card className="p-6 space-y-6">
            <div className="flex flex-row items-center justify-between">
              <H2>Call for paper metrics</H2>
              <ChartSelector selected={chartSelected} onSelect={setChartSelected} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-3">
              <StatisticCard label="Proposals" stat={`${metrics.proposalsCount}`} />
              <StatisticCard label="Speakers" stat={`${metrics.speakersCount}`} />
              <ProgressCard
                label="Proposals reviewed by you."
                value={metrics.reviewsCount}
                max={metrics.proposalsCount}
              />
            </div>

            <ProposalsByDayChart type={chartSelected} data={metrics.byDays} />
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:gap-6 sm:grid-cols-2">
          {metrics.byFormats && <BarListCard label="Proposals by formats" data={metrics.byFormats} />}
          {metrics.byCategories && <BarListCard label="Proposals by categories" data={metrics.byCategories} />}
        </div>

        <div className="flex">
          <SponsorLink />
        </div>
      </div>
    </Page>
  );
}
