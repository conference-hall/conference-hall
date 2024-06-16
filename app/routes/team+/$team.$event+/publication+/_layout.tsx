import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, Outlet, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Publication } from '~/.server/publications/Publication';
import { Card } from '~/design-system/layouts/Card';
import { PageContent } from '~/design-system/layouts/PageContent';
import { H1, H2, Subtitle } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { useEvent } from '~/routes/$event+/__components/useEvent';

import { useTeam } from '../../__components/useTeam';
import { PublicationCard } from './__components/publication-card';
import { Statistic, StatisticLink } from './__components/statistic';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.team, 'Invalid team slug');
  const results = Publication.for(userId, params.team, params.event);
  return json(await results.statistics());
};

export default function PublicationRoute() {
  const statistics = useLoaderData<typeof loader>();
  const { team } = useTeam();
  const { event } = useEvent();
  const reviewsPath = `/team/${team.slug}/${event.slug}`;

  return (
    <PageContent className="flex flex-col">
      <H1 srOnly>Deliberation</H1>

      <section className="space-y-2">
        <H2>Deliberation</H2>
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
            <StatisticLink
              name="total-proposals"
              label="Total proposals"
              value={statistics.deliberation.total}
              to={reviewsPath}
            />
            <StatisticLink
              name="total-accepted"
              label="Accepted proposals"
              value={statistics.deliberation.accepted}
              to={{ pathname: reviewsPath, search: 'status=accepted' }}
            />
            <StatisticLink
              name="total-rejected"
              label="Rejected proposals"
              value={statistics.deliberation.rejected}
              to={{ pathname: reviewsPath, search: 'status=rejected' }}
            />
            <StatisticLink
              name="total-pending"
              label="Pending proposals"
              value={statistics.deliberation.pending}
              to={{ pathname: reviewsPath, search: 'status=pending' }}
            />
          </dl>
        </Card>
      </section>

      <section className="space-y-2">
        <H2>Publication</H2>
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
          <PublicationCard
            id="publish-accepted"
            title="Publish accepted proposals"
            subtitle="Announce results to speakers for accepted proposals."
            statistics={statistics.accepted}
            to="accepted"
          />
          <PublicationCard
            id="publish-rejected"
            title="Publish rejected proposals"
            subtitle="Announce results to speakers for rejected proposals."
            statistics={statistics.rejected}
            to="rejected"
          />
        </div>
      </section>

      <section className="space-y-2">
        <H2>Confirmation</H2>
        <Subtitle>
          Some insights about speakers confirmations. Click on a metric card to see the corresponding proposals.
        </Subtitle>
        <Card className="p-4">
          <dl className="flex flex-col md:flex-row md:justify-around text-center md:divide-x">
            <Statistic name="total-confirmations" label="Total published" value={statistics.accepted.published} />
            <StatisticLink
              name="total-no-response"
              label="Waiting for confirmation"
              value={statistics.confirmations.pending}
              to={{ pathname: reviewsPath, search: 'status=not-answered' }}
            />
            <StatisticLink
              name="total-confirmed"
              label="Confirmed by speakers"
              value={statistics.confirmations.confirmed}
              to={{ pathname: reviewsPath, search: 'status=confirmed' }}
            />
            <StatisticLink
              name="total-declined"
              label="Declined by speakers"
              value={statistics.confirmations.declined}
              to={{ pathname: reviewsPath, search: 'status=declined' }}
            />
          </dl>
        </Card>
      </section>

      <Outlet context={statistics} />
    </PageContent>
  );
}
