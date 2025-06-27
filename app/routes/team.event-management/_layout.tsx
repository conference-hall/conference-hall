import { Outlet, redirect } from 'react-router';
import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { requireUserSession } from '~/libs/auth/session.ts';
import { CurrentEventTeamProvider } from '~/routes/components/contexts/event-team-context.tsx';
import type { Route } from './+types/_layout.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);

  const url = new URL(request.url);
  if (url.pathname === `/team/${params.team}/${params.event}`) {
    return redirect(`/team/${params.team}/${params.event}/overview`);
  }

  return UserEvent.for(userId, params.team, params.event).get();
};

export default function EventLayoutRoute({ loaderData: event }: Route.ComponentProps) {
  return (
    <CurrentEventTeamProvider event={event}>
      <Outlet />
    </CurrentEventTeamProvider>
  );
}
