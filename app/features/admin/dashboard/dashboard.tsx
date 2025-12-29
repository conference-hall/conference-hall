import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Await } from 'react-router';
import { KpiProgressBar } from '~/design-system/dashboard/kpi-progress-bar.tsx';
import { StatisticCard } from '~/design-system/dashboard/statistic-card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H1 } from '~/design-system/typography.tsx';
import { RequireAuthContext } from '~/shared/authentication/auth.middleware.ts';
import type { Route } from './+types/dashboard.ts';
import { AdminDashboard } from './services/dashboard.server.ts';

export const loader = async ({ context }: Route.LoaderArgs) => {
  const authUser = context.get(RequireAuthContext);
  const dashboard = await AdminDashboard.for(authUser.id);
  return {
    users: dashboard.usersMetrics(),
    conferences: dashboard.eventsMetrics('CONFERENCE'),
    meetups: dashboard.eventsMetrics('MEETUP'),
    teams: dashboard.teamsMetrics(),
    proposals: dashboard.proposalsMetrics(),
  };
};

export default function AdminDashboardRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { users, conferences, meetups, teams, proposals } = loaderData;

  return (
    <Page>
      <H1 srOnly>{t('admin.nav.dashboard')}</H1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
        <Suspense fallback={t('common.loading')}>
          <Await resolve={users}>
            {(users) => (
              <StatisticCard label={t('admin.dashboard.users.label')} stat={users.total}>
                <StatisticCard.Content className="space-y-3">
                  <KpiProgressBar label={t('common.speakers')} value={users.speakers} max={users.total} />
                  <KpiProgressBar label={t('common.organizers')} value={users.organizers} max={users.total} />
                </StatisticCard.Content>
              </StatisticCard>
            )}
          </Await>
        </Suspense>

        <Suspense fallback={t('common.loading')}>
          <Await resolve={teams}>
            {(teams) => (
              <StatisticCard label={t('admin.dashboard.teams.label')} stat={teams.total}>
                <StatisticCard.Content className="space-y-3">
                  <KpiProgressBar label={t('common.owners')} value={teams.owners} max={teams.organizers} />
                  <KpiProgressBar label={t('common.members')} value={teams.members} max={teams.organizers} />
                  <KpiProgressBar label={t('common.reviewers')} value={teams.reviewers} max={teams.organizers} />
                </StatisticCard.Content>
              </StatisticCard>
            )}
          </Await>
        </Suspense>

        <Suspense fallback={t('common.loading')}>
          <Await resolve={conferences}>
            {(conferences) => (
              <StatisticCard label={t('admin.dashboard.conferences.label')} stat={conferences.total}>
                <StatisticCard.Content className="space-y-3">
                  <KpiProgressBar
                    label={t('admin.dashboard.conferences.public')}
                    value={conferences.public}
                    max={conferences.total}
                  />
                  <KpiProgressBar
                    label={t('admin.dashboard.conferences.cfp-open')}
                    value={conferences.cfpOpen}
                    max={conferences.total}
                  />
                </StatisticCard.Content>
              </StatisticCard>
            )}
          </Await>
        </Suspense>

        <Suspense fallback={t('common.loading')}>
          <Await resolve={meetups}>
            {(meetups) => (
              <StatisticCard label={t('admin.dashboard.meetups.label')} stat={meetups.total}>
                <StatisticCard.Content className="space-y-3">
                  <KpiProgressBar
                    label={t('admin.dashboard.meetups.public')}
                    value={meetups.public}
                    max={meetups.total}
                  />
                  <KpiProgressBar
                    label={t('admin.dashboard.meetups.cfp-open')}
                    value={meetups.cfpOpen}
                    max={meetups.total}
                  />
                </StatisticCard.Content>
              </StatisticCard>
            )}
          </Await>
        </Suspense>

        <Suspense fallback={t('common.loading')}>
          <Await resolve={proposals}>
            {(proposals) => (
              <StatisticCard label={t('admin.dashboard.proposals.label')} stat={proposals.total}>
                <StatisticCard.Content className="space-y-3">
                  <KpiProgressBar
                    label={t('admin.dashboard.proposals.submitted')}
                    value={proposals.submitted}
                    max={proposals.total}
                  />
                </StatisticCard.Content>
              </StatisticCard>
            )}
          </Await>
        </Suspense>
      </div>
    </Page>
  );
}
