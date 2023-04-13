import invariant from 'tiny-invariant';
import type { LoaderArgs, SerializeFrom } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import { sessionRequired } from '~/libs/auth/auth.server';
import { mapErrorToResponse } from '~/libs/errors';
import type { OrganizationContext } from '../organizer.$orga/route';
import { getEvent } from './server/get-event.server';

export type OrganizerEventRouteData = SerializeFrom<typeof loader>;

export type OrganizerEventContext = { event: OrganizerEventRouteData };

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.event, 'Invalid event slug');
  try {
    const event = await getEvent(params.event, uid);
    return json(event);
  } catch (e) {
    throw mapErrorToResponse(e);
  }
};

export default function OrganizationEventRoute() {
  const event = useLoaderData<typeof loader>();
  const { organization } = useOutletContext<OrganizationContext>();

  return <Outlet context={{ organization, event }} />;
}
