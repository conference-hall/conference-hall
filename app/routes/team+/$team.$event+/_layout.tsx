import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { requireSession } from '~/libs/auth/session.ts';
import { useUser } from '~/root.tsx';

import { useTeam } from '../$team.tsx';
import type { TeamEvent } from './__server/get-event.server.ts';
import { getTeamEvent } from './__server/get-event.server.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const event = await getTeamEvent(params.event, userId);
  return json(event);
};

export default function TeamEventLayoutRoute() {
  const { user } = useUser();
  const { team } = useTeam();

  const event = useLoaderData<typeof loader>();

  return <Outlet context={{ user, team, event }} />;
}

export function useTeamEvent() {
  return useOutletContext<{ event: TeamEvent }>();
}
