import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { useCurrentEvent } from '~/features/event-management/event-team-context.tsx';
import { useCurrentTeam } from '~/features/team-management/team-context.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/overview.ts';
import { CfpStatusCard } from './components/cfp-tab/cfp-status-card.tsx';
import { ReviewStatusCard } from './components/cfp-tab/review-status-card.tsx';
import { VisibilityStatusCard } from './components/cfp-tab/visibility-status-card.tsx';
import { DashboardTabs } from './components/dashboard-tabs.tsx';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export default function OverviewRoute({ params }: Route.ComponentProps) {
  const { t } = useTranslation();
  const currentTeam = useCurrentTeam();
  const currentEvent = useCurrentEvent();
  const { canEditEvent } = currentTeam.userPermissions;

  return (
    <Page>
      <h1 className="sr-only">{t('event-management.overview.heading')}</h1>
      <div className="space-y-4 lg:space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-3">
          <CfpStatusCard
            team={params.team}
            event={params.event}
            cfpState={currentEvent.cfpState}
            cfpStart={currentEvent.cfpStart}
            cfpEnd={currentEvent.cfpEnd}
            timezone={currentEvent.timezone}
            showActions={canEditEvent}
          />

          <VisibilityStatusCard
            team={params.team}
            event={params.event}
            visibility={currentEvent.visibility}
            showActions={canEditEvent}
          />

          <ReviewStatusCard
            team={params.team}
            event={params.event}
            reviewEnabled={currentEvent.reviewEnabled}
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
