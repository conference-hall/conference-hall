import { ArrowTopRightOnSquareIcon, HomeIcon } from '@heroicons/react/20/solid';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import { CfpLabel } from '~/components/CfpInfo';
import { EventTabs } from '~/components/event-forms/EventTabs';
import Badge from '~/design-system/Badges';
import { Container } from '~/design-system/Container';
import { H1, H2 } from '~/design-system/Typography';
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
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          <H1 className="sr-only">Event page</H1>
          <H2 className="flex items-center gap-4">
            <Link to="/organizer" className="truncate hover:underline">
              <HomeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </Link>
            <ChevronRightIcon className="h-4 w-4 text-gray-600" />
            <Link to={`/organizer/${organization.slug}`} className="truncate hover:underline">
              {organization.name}
            </Link>
            <ChevronRightIcon className="h-4 w-4 text-gray-600" />
            <Link to={`/${event.slug}`} target="_blank" className="flex items-center truncate hover:underline">
              {event.name}
              <ArrowTopRightOnSquareIcon className="ml-2 h-4 w-4" />
            </Link>
          </H2>
          <div className="flex items-center gap-2">
            <Badge>{event.type.toLowerCase()}</Badge>
            <Badge color={event.visibility === 'PRIVATE' ? 'red' : 'green'}>{event.visibility.toLowerCase()}</Badge>
          </div>
        </div>
        <CfpLabel cfpState={event.cfpState} className="hidden sm:flex" />
      </Container>
      <EventTabs orgaSlug={organization.slug} eventSlug={event.slug} role={organization.role} />
      <Outlet context={{ event }} />
    </>
  );
}
