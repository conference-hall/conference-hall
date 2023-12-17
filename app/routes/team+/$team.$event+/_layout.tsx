import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserEvent } from '~/.server/organizer-event-settings/UserEvent.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { useUser } from '~/routes/__components/useUser.tsx';

import { useTeam } from '../__components/useTeam.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const event = await UserEvent.for(userId, params.team, params.event).get();
  return json(event);
};

export default function EventLayoutRoute() {
  const { user } = useUser();
  const { team } = useTeam();

  const event = useLoaderData<typeof loader>();

  return <Outlet context={{ user, team, event }} />;
}
