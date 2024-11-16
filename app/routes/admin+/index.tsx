import type { LoaderFunctionArgs } from '@remix-run/node';
import { Await, useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';
import { AdminDashboard } from '~/.server/admin/admin-dashboard.ts';
import { KpiProgressBar } from '~/design-system/dashboard/kpi-progress-bar.tsx';
import { StatisticCard } from '~/design-system/dashboard/statistic-card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H1 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);

  const dashboard = await AdminDashboard.for(userId);

  return {
    users: dashboard.usersMetrics(),
    conferences: dashboard.eventsMetrics('CONFERENCE'),
    meetups: dashboard.eventsMetrics('MEETUP'),
    teams: dashboard.teamsMetrics(),
    proposals: dashboard.proposalsMetrics(),
  };
};

export default function AdminDashboardRoute() {
  const { users, conferences, meetups, teams, proposals } = useLoaderData<typeof loader>();
  return (
    <Page>
      <H1 srOnly>Dashboard</H1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        <Suspense fallback="Loading...">
          <Await resolve={users}>
            {(users) => (
              <StatisticCard label="Total users" stat={users.total}>
                <StatisticCard.Content className="space-y-3">
                  <KpiProgressBar label="Speakers" value={users.speakers} max={users.total} />
                  <KpiProgressBar label="Organizers" value={users.organizers} max={users.total} />
                </StatisticCard.Content>
              </StatisticCard>
            )}
          </Await>
        </Suspense>

        <Suspense fallback="Loading...">
          <Await resolve={teams}>
            {(teams) => (
              <StatisticCard label="Total teams" stat={teams.total}>
                <StatisticCard.Content className="space-y-3">
                  <KpiProgressBar label="Owners" value={teams.owners} max={teams.organizers} />
                  <KpiProgressBar label="Members" value={teams.members} max={teams.organizers} />
                  <KpiProgressBar label="Reviewers" value={teams.reviewers} max={teams.organizers} />
                </StatisticCard.Content>
              </StatisticCard>
            )}
          </Await>
        </Suspense>

        <Suspense fallback="Loading...">
          <Await resolve={conferences}>
            {(conferences) => (
              <StatisticCard label="Total conferences" stat={conferences.total}>
                <StatisticCard.Content className="space-y-3">
                  <KpiProgressBar label="Public conferences" value={conferences.public} max={conferences.total} />
                  <KpiProgressBar label="With CFP open" value={conferences.cfpOpen} max={conferences.total} />
                </StatisticCard.Content>
              </StatisticCard>
            )}
          </Await>
        </Suspense>

        <Suspense fallback="Loading...">
          <Await resolve={meetups}>
            {(meetups) => (
              <StatisticCard label="Total meetups" stat={meetups.total}>
                <StatisticCard.Content className="space-y-3">
                  <KpiProgressBar label="Public meetups" value={meetups.public} max={meetups.total} />
                  <KpiProgressBar label="With CFP open" value={meetups.cfpOpen} max={meetups.total} />
                </StatisticCard.Content>
              </StatisticCard>
            )}
          </Await>
        </Suspense>

        <Suspense fallback="Loading...">
          <Await resolve={proposals}>
            {(proposals) => (
              <StatisticCard label="Total proposals" stat={proposals.total}>
                <StatisticCard.Content className="space-y-3">
                  <KpiProgressBar label="Submitted" value={proposals.submitted} max={proposals.total} />
                </StatisticCard.Content>
              </StatisticCard>
            )}
          </Await>
        </Suspense>
      </div>
    </Page>
  );
}
