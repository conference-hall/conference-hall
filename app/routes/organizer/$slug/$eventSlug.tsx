import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import { CfpElapsedTime } from '~/components/CfpInfo';
import { EventTabs } from '~/components/event-forms/EventTabs';
import OrganizationBreadcrumb from '~/components/organizations/OrganizationBreadcrumb';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { mapErrorToResponse } from '~/services/errors';
import { getEvent } from '~/services/organizers/event.server';
import type { OrganizationContext } from '../$slug';

export type OrganizerEventContext = {
  event: Awaited<ReturnType<typeof getEvent>>;
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const uid = await sessionRequired(request);
  try {
    const eventSlug = params.eventSlug!;
    const event = await getEvent(eventSlug, uid);
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
      <Container as="header" className="my-4 flex flex-col sm:flex-row sm:justify-between">
        <OrganizationBreadcrumb title="Event page" organization={organization} event={event} />
        <CfpElapsedTime
          cfpState={event.cfpState}
          cfpStart={event.cfpStart}
          cfpEnd={event.cfpEnd}
          className="hidden sm:flex"
        />
      </Container>
      <EventTabs orgaSlug={organization.slug} eventSlug={event.slug} role={organization.role} />
      <Outlet context={{ event }} />
    </>
  );
}
