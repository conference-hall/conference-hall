import type { LoaderFunctionArgs } from '@remix-run/node';
import { json, useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import invariant from 'tiny-invariant';

import { EventMetrics } from '~/.server/event-metrics/event-metrics.tsx';
import { BarListCard } from '~/design-system/dashboard/bar-list-card.tsx';
import { ProgressCard } from '~/design-system/dashboard/progress-card.tsx';
import { StatisticCard } from '~/design-system/dashboard/statistic-card.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H3 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';

import { useTeam } from '../__components/use-team.tsx';
import { CfpStatusCard } from './__components/overview-page/cfp-status-card.tsx';
import type { ChartSelectorValue } from './__components/overview-page/charts-selector.tsx';
import { ChartSelector } from './__components/overview-page/charts-selector.tsx';
import { CountByDayChart } from './__components/overview-page/count-by-day-chart.tsx';
import { CumulativeByDayChart } from './__components/overview-page/cumulative-by-day-chart.tsx';
import { ReviewStatusCard } from './__components/overview-page/review-status-card.tsx';
import { VisibilityStatusCard } from './__components/overview-page/visibility-status-card.tsx';
import { useEvent } from './__components/useEvent.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const metrics = await EventMetrics.for(userId, params.team, params.event).globalMetrics();
  return json(metrics);
};

export default function OverviewRoute() {
  const { team } = useTeam();
  const { event } = useEvent();
  const metrics = useLoaderData<typeof loader>();

  const [chartSelected, setChartSelected] = useState<ChartSelectorValue>('cumulative');

  const showActions = team.role === 'OWNER' || team.role === 'REVIEWER';

  return (
    <Page>
      <h1 className="sr-only">Event overview</h1>
      <div className="space-y-4 lg:space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-3">
          <CfpStatusCard
            cfpState={event.cfpState}
            cfpStart={event.cfpStart}
            cfpEnd={event.cfpEnd}
            showActions={showActions}
          />

          <VisibilityStatusCard slug={event.slug} visibility={event.visibility} showActions={showActions} />

          <ReviewStatusCard reviewEnabled={event.reviewEnabled} showActions={showActions} />
        </div>

        <div>
          <Card className="p-6 space-y-6">
            <div className="flex flex-row items-center justify-between">
              <H3>Call for paper metrics</H3>
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

            {chartSelected === 'cumulative' ? (
              <CumulativeByDayChart data={metrics.byDays} />
            ) : (
              <CountByDayChart data={metrics.byDays} />
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:gap-6 sm:grid-cols-2">
          {metrics.byFormats && <BarListCard label="Proposals by formats" data={metrics.byFormats} />}
          {metrics.byCategories && <BarListCard label="Proposals by categories" data={metrics.byCategories} />}
        </div>
      </div>
    </Page>
  );
}
