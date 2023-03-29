import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import OrganizationBreadcrumb from '~/shared-components/organizations/OrganizationBreadcrumb';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/libs/auth/auth.server';
import { mapErrorToResponse } from '~/libs/errors';
import type { OrganizationContext } from '../organizer.$orga/route';
import { getEvent } from './server/get-event.server';
import { EventTabs } from './components/EventTabs';
import { CfpElapsedTime } from '~/shared-components/cfp/CfpElapsedTime';

export type OrganizerEventContext = {
  event: Awaited<ReturnType<typeof getEvent>>;
};

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

export const handle = { isEventPage: true };

export default function OrganizationEventRoute() {
  const event = useLoaderData<typeof loader>();
  const { organization } = useOutletContext<OrganizationContext>();
  return (
    <>
      <header className="bg-gray-800">
        <Container className="flex flex-col sm:flex-row sm:justify-between">
          <OrganizationBreadcrumb title="Event page" organization={organization} event={event} />
          <CfpElapsedTime
            cfpState={event.cfpState}
            cfpStart={event.cfpStart}
            cfpEnd={event.cfpEnd}
            className="hidden sm:flex"
          />
        </Container>
      </header>
      <EventTabs orgaSlug={organization.slug} eventSlug={event.slug} role={organization.role} />
      <Outlet context={{ event }} />
    </>
  );
}
