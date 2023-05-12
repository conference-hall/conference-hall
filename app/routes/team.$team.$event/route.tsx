import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import { requireSession } from '~/libs/auth/session';
import type { OrganizerEvent } from './server/get-organizer-event.server';
import { getOrganizerEvent } from './server/get-organizer-event.server';
import { useTeam } from '../team.$team/route';
import { useUser } from '~/root';

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const event = await getOrganizerEvent(params.event, userId);
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
