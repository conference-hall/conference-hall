import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { useUser } from '~/root';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import { Navbar } from '~/shared-components/navbar/Navbar';
import { mapErrorToResponse } from '~/libs/errors';
import { getEvent } from '~/shared-server/events/get-event.server';
import { EventHeader } from './components/EventHeader';
import { EventTabs } from './components/EventTabs';
import { Footer } from '~/shared-components/Footer';
import { SpeakerNavLinks } from '~/shared-components/navbar/SpeakerNavLinks';

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
  const event = useLoaderData<typeof loader>();
  const { user } = useUser();

  return (
    <>
      <Navbar user={user} withSearch>
        <SpeakerNavLinks organizations={user?.organizations} />
      </Navbar>

      <EventHeader
        type={event.type}
        name={event.name}
        slug={event.slug}
        bannerUrl={event.bannerUrl}
        address={event.address}
        conferenceStart={event.conferenceStart}
        conferenceEnd={event.conferenceEnd}
      />

      <EventTabs slug={event.slug} type={event.type} surveyEnabled={event.surveyEnabled} />

      <Outlet context={event} />

      <Footer />
    </>
  );
}

export function useEvent() {
  return useOutletContext<Awaited<ReturnType<typeof getEvent>>>();
}
