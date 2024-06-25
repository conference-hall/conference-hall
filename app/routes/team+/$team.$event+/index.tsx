import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { ButtonLink } from '~/design-system/buttons.tsx';
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

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  return null;
};

const data = [
  { name: '/home', value: 843 },
  { name: '/imprint', value: 46 },
  { name: '/cancellation', value: 3 },
  { name: '/blocks', value: 108 },
  { name: '/blocks', value: 108 },
  { name: '/documentation', value: 384 },
];

export default function OverviewRoute() {
  return (
    <Page className="space-y-10">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatusCard status="success" label={formatCFPState('OPENED')} subtitle="Open until 25/06/2024 10:23 AM">
            <Link to="/" className="font-medium">
              Change →
            </Link>
          </StatusCard>

          <StatusCard status="success" label="Visibility is public" subtitle="The event is available in the search.">
            <Link to="/" className="font-medium">
              Share <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
            </Link>
            <Link to="/" className="font-medium">
              Change →
            </Link>
          </StatusCard>

          <StatusCard status="success" label="Reviews are enabled" subtitle="All team members can review proposals.">
            <Link to="/" className="font-medium">
              Change →
            </Link>
          </StatusCard>
        </div>
      </div>

      <div className="space-y-6">
        <Page.Heading title="Call for paper metric" subtitle="Analyze and understand your call for paper." level="2">
          <ButtonLink to="reviews" variant="secondary">
            View all proposals
          </ButtonLink>
        </Page.Heading>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatisticCard label="Proposals" stat="612" />
          <StatisticCard label="Speakers" stat="710" />
          <ProgressCard label="Proposals reviewed by you." value={75} max={100} />
        </div>
        <div>
          <Card className="p-6 space-y-4">
            <H3>Submissions</H3>
            <ChartEmptyState />
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <BarListCard label="Formats" metric="PROPOSALS" data={data} />
          <BarListCard label="Categories" metric="PROPOSALS" />
        </div>
      </div>
    </Page>
  );
}
