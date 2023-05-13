import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { requireSession } from '~/libs/auth/session';
import { useUser } from '~/root';

import { useTeam } from '../team.$team/route';
import type { OrganizerEvent } from './server/get-event.server';
import { getTeamEvent } from './server/get-event.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const event = await getTeamEvent(params.event, userId);
  return json(event);
};

export default function OrganizationEventRoute() {
  const { user } = useUser();
  const { team } = useTeam();

  const event = useLoaderData<typeof loader>();

  return <Outlet context={{ user, team, event }} />;
}

export function useOrganizerEvent() {
  return useOutletContext<{ event: OrganizerEvent }>();
}
