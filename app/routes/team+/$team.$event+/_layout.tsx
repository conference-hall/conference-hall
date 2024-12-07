import type { LoaderFunctionArgs } from 'react-router';
import { Outlet, useLoaderData } from 'react-router';
import invariant from 'tiny-invariant';

import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { CurrentEventTeamProvider } from '~/routes/__components/contexts/event-team-context';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  return UserEvent.for(userId, params.team, params.event).get();
};

export default function EventLayoutRoute() {
  const event = useLoaderData<typeof loader>();

  return (
    <CurrentEventTeamProvider event={event}>
      <Outlet />
    </CurrentEventTeamProvider>
  );
}
