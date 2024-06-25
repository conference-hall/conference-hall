import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { EventMetrics } from '~/.server/event-metrics/event-metrics.tsx';
import { ChartEmptyState } from '~/design-system/charts/chart-empty-state.tsx';
import { BarListCard } from '~/design-system/charts/dashboard/bar-list-card.tsx';
import { ProgressCard } from '~/design-system/charts/dashboard/progress-card.tsx';
import { StatisticCard } from '~/design-system/charts/dashboard/statistic-card.tsx';
import { StatusCard } from '~/design-system/charts/dashboard/status-card.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { H3 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { formatCFPState } from '~/libs/formatters/cfp.ts';

import { useEvent } from './__components/useEvent.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const metrics = await EventMetrics.for(userId, params.team, params.event).metrics();
  return json(metrics);
};

export default function OverviewRoute() {
  const { event } = useEvent();
  const metrics = useLoaderData<typeof loader>();

  return (
    <Page>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <StatusCard status="success" label={formatCFPState(event.cfpState)} subtitle="Open until 25/06/2024 10:23 AM">
            <Link to="settings/cfp" className="font-medium">
              Change →
            </Link>
          </StatusCard>

          <StatusCard status="success" label="Visibility is public" subtitle="The event is available in the search.">
            <Link to={`/${event.slug}`} className="font-medium">
              Share <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
            </Link>
            <Link to="settings" className="font-medium">
              Change →
            </Link>
          </StatusCard>

          <StatusCard status="success" label="Reviews are enabled" subtitle="All team members can review proposals.">
            <Link to="settings/review" className="font-medium">
              Change →
            </Link>
          </StatusCard>
        </div>

        <div>
          <Card className="p-6 space-y-4">
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
            <ChartEmptyState />
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
