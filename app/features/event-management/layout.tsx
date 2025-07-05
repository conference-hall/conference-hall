import { Outlet, redirect } from 'react-router';
import { CurrentEventTeamProvider } from '~/features/event-management/event-team-context.tsx';
import { EventSettings } from '~/features/event-management/settings/services/event-settings.server.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/layout.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);

  const url = new URL(request.url);
  if (url.pathname === `/team/${params.team}/${params.event}`) {
    return redirect(`/team/${params.team}/${params.event}/overview`);
  }

  return EventSettings.for(userId, params.team, params.event).get();
};

export default function EventLayoutRoute({ loaderData: event }: Route.ComponentProps) {
  return (
    <CurrentEventTeamProvider event={event}>
      <Outlet />
    </CurrentEventTeamProvider>
  );
}
