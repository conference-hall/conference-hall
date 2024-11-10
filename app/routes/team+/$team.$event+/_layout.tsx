import type { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { requireSession } from '~/libs/auth/session.ts';

import { useTeam } from '../__components/use-team.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  return UserEvent.for(userId, params.team, params.event).get();
};

export default function EventLayoutRoute() {
  const { team } = useTeam();

  const event = useLoaderData<typeof loader>();

  return <Outlet context={{ team, event }} />;
}
