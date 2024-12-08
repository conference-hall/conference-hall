import { Outlet } from 'react-router';
import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { CurrentEventTeamProvider } from '~/routes/__components/contexts/event-team-context';
import type { Route } from './+types/_layout.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const userId = await requireSession(request);
  return UserEvent.for(userId, params.team, params.event).get();
};

export default function EventLayoutRoute({ loaderData: event }: Route.ComponentProps) {
  return (
    <CurrentEventTeamProvider event={event}>
      <Outlet />
    </CurrentEventTeamProvider>
  );
}
