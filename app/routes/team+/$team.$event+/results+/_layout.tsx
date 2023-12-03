import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Card } from '~/design-system/layouts/Card';
import { PageContent } from '~/design-system/layouts/PageContent';
import { Link } from '~/design-system/Links';
import { H1, H2 } from '~/design-system/Typography.tsx';
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

export default function ResultsAnnouncementRoute() {
  const statistics = useLoaderData<typeof loader>();

  return (
    <PageContent className="flex flex-col">
      <H1 srOnly>Results announcement</H1>

      <section className="space-y-4">
        <H2>Deliberation results</H2>
        <Card className="p-2">
          <dl className="flex flex-wrap justify-around text-center">
            <Link
              to="accepted"
              className="grow flex flex-col p-2 px-4 items-center hover:bg-slate-100 hover:no-underline rounded"
            >
              <dt className="truncate text-sm font-medium text-gray-500">Total proposals</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {statistics.submitted + statistics.accepted.total + statistics.rejected.total}
              </dd>
            </Link>
            <Link
              to="accepted"
              className="grow flex flex-col p-2 px-4 items-center hover:bg-slate-100 hover:no-underline rounded"
            >
              <dt className="truncate text-sm font-medium text-gray-500">Accepted proposals</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{statistics.accepted.total}</dd>
            </Link>
            <Link
              to="accepted"
              className="grow flex flex-col p-2 px-4 items-center hover:bg-slate-100 hover:no-underline rounded"
            >
              <dt className="truncate text-sm font-medium text-gray-500">Rejected proposals</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{statistics.rejected.total}</dd>
            </Link>
            <Link
              to="accepted"
              className="grow flex flex-col p-2 px-4 items-center hover:bg-slate-100 hover:no-underline rounded"
            >
              <dt className="truncate text-sm font-medium text-gray-500">Not deliberated proposals</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{statistics.submitted}</dd>
            </Link>
          </dl>
        </Card>
      </section>

      <section className="space-y-4">
        <H2>Announce results</H2>
        <ul className="flex flex-col gap-4 lg:flex-row lg:gap-8">
          <AnnouncementCard
            title="Accepted proposals"
            subtitle="Announce results to speakers for accepted proposals."
            statistics={statistics.accepted}
            to="accepted"
          />
          <AnnouncementCard
            title="Rejected proposals"
            subtitle="Announce results to speakers for rejected proposals."
            statistics={statistics.rejected}
            to="rejected"
          />
        </ul>
      </section>

      <section className="space-y-4">
        <H2>Speakers confirmations</H2>
        <Card className="p-2">
          <dl className="flex flex-wrap justify-around text-center">
            <Link
              to="accepted"
              className="grow flex flex-col p-2 px-4 items-center hover:bg-slate-100 hover:no-underline rounded"
            >
              <dt className="truncate text-sm font-medium text-gray-500">Total accepted</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{statistics.accepted.total}</dd>
            </Link>
            <Link
              to="accepted"
              className="grow flex flex-col p-2 px-4 items-center hover:bg-slate-100 hover:no-underline rounded"
            >
              <dt className="truncate text-sm font-medium text-gray-500">No response yet</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{statistics.accepted.total}</dd>
            </Link>
            <Link
              to="accepted"
              className="grow flex flex-col p-2 px-4 items-center hover:bg-slate-100 hover:no-underline rounded"
            >
              <dt className="truncate text-sm font-medium text-gray-500">Confirmed by speakers</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">0</dd>
            </Link>
            <Link
              to="accepted"
              className="grow flex flex-col p-2 px-4 items-center hover:bg-slate-100 hover:no-underline rounded"
            >
              <dt className="truncate text-sm font-medium text-gray-500">Declined by speakers</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">0</dd>
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
