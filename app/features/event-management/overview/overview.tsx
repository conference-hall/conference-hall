import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';
import { useUserTeamPermissions } from '~/app-platform/components/user-context.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import type { Route } from './+types/overview.ts';
import { CfpStatusCard } from './components/cfp-tab/cfp-status-card.tsx';
import { ReviewStatusCard } from './components/cfp-tab/review-status-card.tsx';
import { VisibilityStatusCard } from './components/cfp-tab/visibility-status-card.tsx';
import { DashboardTabs } from './components/dashboard-tabs.tsx';

export default function OverviewRoute({ params }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { event } = useCurrentEventTeam();
  const { canEditEvent } = useUserTeamPermissions();

  return (
    <Page>
      <h1 className="sr-only">{t('event-management.overview.heading')}</h1>
      <div className="space-y-4 lg:space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-3">
          <CfpStatusCard
            team={params.team}
            event={params.event}
            cfpState={event.cfpState}
            cfpStart={event.cfpStart}
            cfpEnd={event.cfpEnd}
            timezone={event.timezone}
            showActions={canEditEvent}
          />

          <VisibilityStatusCard
            team={params.team}
            event={params.event}
            visibility={event.visibility}
            showActions={canEditEvent}
          />

          <ReviewStatusCard
            team={params.team}
            event={params.event}
            reviewEnabled={event.reviewEnabled}
            showActions={canEditEvent}
          />
        </div>

        <div>
          <Card className="pb-6 space-y-8">
            <DashboardTabs team={params.team} event={params.event} />
            <Outlet />
          </Card>
        </div>
      </div>
    </Page>
  );
}
