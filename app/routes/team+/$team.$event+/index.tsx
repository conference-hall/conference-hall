import type { LoaderFunctionArgs } from '@remix-run/node';
import { json, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { EventMetrics } from '~/.server/event-metrics/event-metrics.tsx';
import { BarListCard } from '~/design-system/charts/dashboard/bar-list-card.tsx';
import { ProgressCard } from '~/design-system/charts/dashboard/progress-card.tsx';
import { StatisticCard } from '~/design-system/charts/dashboard/statistic-card.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H3 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';

import { useTeam } from '../__components/use-team.tsx';
import { CfpStatusCard } from './__components/overview/cfp-status-card.tsx';
import { ReviewStatusCard } from './__components/overview/review-status-card.tsx';
import { SubmissionsChart } from './__components/overview/submissions-chart.tsx';
import { VisibilityStatusCard } from './__components/overview/visibility-status-card.tsx';
import { useEvent } from './__components/useEvent.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const metrics = await EventMetrics.for(userId, params.team, params.event).metrics();
  return json(metrics);
};

const DATA = [
  { date: '2023-02-01', value: 1 },
  { date: '2023-02-02', value: 2 },
  { date: '2023-03-01', value: 3 },
  { date: '2023-04-01', value: 10 },
  { date: '2023-04-02', value: 10 },
  { date: '2023-04-03', value: 11 },
  { date: '2023-04-04', value: 14 },
  { date: '2023-04-06', value: 18 },
  { date: '2023-04-07', value: 19 },
  { date: '2023-04-09', value: 21 },
  { date: '2023-04-10', value: 25 },
  { date: '2023-04-12', value: 27 },
  { date: '2023-05-01', value: 29 },
  { date: '2023-05-02', value: 29 },
  { date: '2023-05-03', value: 29 },
  { date: '2023-05-04', value: 29 },
  { date: '2023-05-08', value: 29 },
  { date: '2023-05-09', value: 29 },
  { date: '2023-06-09', value: 29 },
  { date: '2023-09-09', value: 29 },
  { date: '2023-10-09', value: 29 },
  { date: '2023-11-09', value: 29 },
  { date: '2023-11-10', value: 29 },
  { date: '2023-11-11', value: 29 },
  { date: '2023-11-12', value: 29 },
  { date: '2023-11-13', value: 29 },
];

export default function OverviewRoute() {
  const { team } = useTeam();
  const { event } = useEvent();
  const metrics = useLoaderData<typeof loader>();

  const showActions = team.role === 'OWNER' || team.role === 'REVIEWER';

  return (
    <Page>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
            <H3>Submissions</H3>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <StatisticCard label="Proposals" stat={`${metrics.proposalsCount}`} />
              <StatisticCard label="Speakers" stat={`${metrics.speakersCount}`} />
              <ProgressCard
                label="Proposals reviewed by you."
                value={metrics.reviewsCount}
                max={metrics.proposalsCount}
              />
            </div>

            <SubmissionsChart data={DATA} />
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {metrics.byFormats && <BarListCard label="Formats" metric="PROPOSALS" data={metrics.byFormats} />}
          {metrics.byCategories && <BarListCard label="Categories" metric="PROPOSALS" data={metrics.byCategories} />}
        </div>
      </div>
    </Page>
  );
}
