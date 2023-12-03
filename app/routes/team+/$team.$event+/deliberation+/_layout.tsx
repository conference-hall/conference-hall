import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Card } from '~/design-system/layouts/Card';
import { PageContent } from '~/design-system/layouts/PageContent';
import { H1, H2, Subtitle } from '~/design-system/Typography.tsx';
import type { ResultsStatistics } from '~/domains/organizer-cfp-results/ResultsAnnouncement';
import { ResultsAnnouncement } from '~/domains/organizer-cfp-results/ResultsAnnouncement';
import { requireSession } from '~/libs/auth/session.ts';

import { AnnouncementCard } from './__components/AnnouncementCard';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.team, 'Invalid team slug');
  const results = ResultsAnnouncement.for(userId, params.team, params.event);
  return json(await results.statistics());
};

export default function DeliberationRoute() {
  const statistics = useLoaderData<typeof loader>();

  return (
    <PageContent className="flex flex-col">
      <H1 srOnly>Deliberation</H1>

      <section className="space-y-2">
        <H2>1. Deliberation</H2>
        <Subtitle>
          To deliberate, open the{' '}
          <Link to="/" className="underline">
            Proposals review page
          </Link>
          , select and mark proposals as accepted or rejected. You can also change the deliberation status individually
          on a proposal page.
        </Subtitle>
        <Card className="p-4">
          <dl className="flex flex-col md:flex-row md:justify-around text-center md:divide-x">
            <Link
              to="accepted"
              className="grow flex flex-col p-2 px-4 items-center hover:bg-slate-100 hover:no-underline rounded"
            >
              <dt id="total" className="truncate text-sm font-medium text-gray-500">
                Total proposals
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900" aria-labelledby="total">
                {statistics.submitted + statistics.accepted.total + statistics.rejected.total}
              </dd>
            </Link>
            <Link
              to="accepted"
              className="grow flex flex-col p-2 px-4 items-center hover:bg-slate-100 hover:no-underline rounded"
            >
              <dt id="total-accepted" className="truncate text-sm font-medium text-gray-500">
                Accepted proposals
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900" aria-labelledby="total-accepted">
                {statistics.accepted.total}
              </dd>
            </Link>
            <Link
              to="accepted"
              className="grow flex flex-col p-2 px-4 items-center hover:bg-slate-100 hover:no-underline rounded"
            >
              <dt id="total-rejected" className="truncate text-sm font-medium text-gray-500">
                Rejected proposals
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900" aria-labelledby="total-rejected">
                {statistics.rejected.total}
              </dd>
            </Link>
            <Link
              to="accepted"
              className="grow flex flex-col p-2 px-4 items-center hover:bg-slate-100 hover:no-underline rounded"
            >
              <dt id="total-pending" className="truncate text-sm font-medium text-gray-500">
                Pending proposals
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900" aria-labelledby="total-pending">
                {statistics.submitted}
              </dd>
            </Link>
          </dl>
        </Card>
      </section>

      <section className="space-y-2">
        <H2>2. Announcements</H2>
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
          <AnnouncementCard
            id="announce-accepted"
            title="Announce accepted proposals"
            subtitle="Publish results to speakers for accepted proposals."
            statistics={statistics.accepted}
            to="accepted"
          />
          <AnnouncementCard
            id="announce-rejected"
            title="Announce rejected proposals"
            subtitle="Publish results to speakers for rejected proposals."
            statistics={statistics.rejected}
            to="rejected"
          />
        </div>
      </section>

      <section className="space-y-2">
        <H2>3. Speakers confirmations</H2>
        <Subtitle>
          Some metrics about speakers confirmations. Click on a metric card to see the corresponding proposals.
        </Subtitle>
        <Card className="p-4">
          <dl className="flex flex-col md:flex-row md:justify-around text-center md:divide-x">
            <Link
              to="accepted"
              className="grow flex flex-col p-2 px-4 items-center hover:bg-slate-100 hover:no-underline rounded"
            >
              <dt id="total-confirmations" className="truncate text-sm font-medium text-gray-500">
                Total accepted
              </dt>
              <dd
                aria-labelledby="total-confirmations"
                className="mt-1 text-3xl font-semibold tracking-tight text-gray-900"
              >
                {0}
              </dd>
            </Link>
            <Link
              to="accepted"
              className="grow flex flex-col p-2 px-4 items-center hover:bg-slate-100 hover:no-underline rounded"
            >
              <dt id="total-no-response" className="truncate text-sm font-medium text-gray-500">
                No response yet
              </dt>
              <dd
                aria-labelledby="total-no-response"
                className="mt-1 text-3xl font-semibold tracking-tight text-gray-900"
              >
                {0}
              </dd>
            </Link>
            <Link
              to="accepted"
              className="grow flex flex-col p-2 px-4 items-center hover:bg-slate-100 hover:no-underline rounded"
            >
              <dt id="total-confirmed" className="truncate text-sm font-medium text-gray-500">
                Confirmed by speakers
              </dt>
              <dd
                aria-labelledby="total-confirmed"
                className="mt-1 text-3xl font-semibold tracking-tight text-gray-900"
              >
                0
              </dd>
            </Link>
            <Link
              to="accepted"
              className="grow flex flex-col p-2 px-4 items-center hover:bg-slate-100 hover:no-underline rounded"
            >
              <dt id="total-declined" className="truncate text-sm font-medium text-gray-500">
                Declined by speakers
              </dt>
              <dd aria-labelledby="total-declined" className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                0
              </dd>
            </Link>
          </dl>
        </Card>
      </section>

      <Outlet context={statistics} />
    </PageContent>
  );
}

export const useResultsStatistics = (type?: string) => {
  const statistics = useOutletContext<ResultsStatistics>();
  if (type === 'accepted') return statistics.accepted;
  if (type === 'rejected') return statistics.rejected;
  return null;
};
