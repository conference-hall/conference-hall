import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import { requireSession } from '~/libs/auth/session';
import { mapErrorToResponse } from '~/libs/errors';
import type { OrganizerEvent } from './server/get-organizer-event.server';
import { getOrganizerEvent } from './server/get-organizer-event.server';
import { useOrganization } from '../organizer.$orga/route';
import { useUser } from '~/root';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  try {
    const event = await getOrganizerEvent(params.event, uid);
    return json(event);
  } catch (e) {
    throw mapErrorToResponse(e);
  }
};

export default function OrganizationEventRoute() {
  const { user } = useUser();
  const { organization } = useOrganization();

  const event = useLoaderData<typeof loader>();

  return <Outlet context={{ user, organization, event }} />;
}

export function useOrganizerEvent() {
  return useOutletContext<{ event: OrganizerEvent }>();
}
