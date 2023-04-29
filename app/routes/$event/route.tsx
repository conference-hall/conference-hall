import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { useUser } from '~/root';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import { Navbar } from '~/shared-components/navbar/Navbar';
import { mapErrorToResponse } from '~/libs/errors';
import type { Event } from '~/shared-server/events/get-event.server';
import { getEvent } from '~/shared-server/events/get-event.server';
import { EventHeader } from './components/EventHeader';
import { EventTabs } from './components/EventTabs';
import { Footer } from '~/shared-components/Footer';

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.event, 'Invalid event slug');

  try {
    const event = await getEvent(params.event);
    return json(event);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function EventRoute() {
  const { user } = useUser();
  const event = useLoaderData<typeof loader>();

  return (
    <>
      <Navbar user={user} withSearch />

      <EventHeader
        name={event.name}
        slug={event.slug}
        type={event.type}
        organizationName={event.organizationName}
        logo={event.logo}
        address={event.address}
        conferenceStart={event.conferenceStart}
        conferenceEnd={event.conferenceEnd}
      />

      <EventTabs slug={event.slug} type={event.type} surveyEnabled={event.surveyEnabled} />

      <Outlet context={{ user, event }} />

      <Footer />
    </>
  );
}

export function useEvent() {
  return useOutletContext<{ event: Event }>();
}
