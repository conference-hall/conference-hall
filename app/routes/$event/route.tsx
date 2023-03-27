import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import type { UserContext } from '~/root';
import { json } from '@remix-run/node';
import { Outlet, useCatch, useLoaderData, useOutletContext } from '@remix-run/react';
import { Navbar } from '~/shared-components/navbar/Navbar';
import { ButtonLink } from '~/design-system/Buttons';
import { Container } from '~/design-system/Container';
import { mapErrorToResponse } from '~/libs/errors';
import { getEvent } from '~/shared-server/events/get-event.server';
import { EventHeader } from './components/EventHeader';
import { EventTabs } from './components/EventTabs';

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
  const { user, notifications } = useOutletContext<UserContext>();

  return (
    <>
      <Navbar user={user} notifications={notifications} />
      <EventHeader
        type={event.type}
        name={event.name}
        address={event.address}
        conferenceStart={event.conferenceStart}
        conferenceEnd={event.conferenceEnd}
      />
      <EventTabs slug={event.slug} type={event.type} surveyEnabled={event.surveyEnabled} />
      <Outlet context={event} />
    </>
  );
}

export function useEvent() {
  return useOutletContext<Awaited<ReturnType<typeof getEvent>>>();
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <Container className="mt-8 px-8 py-32 text-center">
      <h1 className="text-8xl font-black text-indigo-400">{caught.status}</h1>
      <p className="mt-10 text-4xl font-bold text-gray-600">{caught.data}</p>
      <ButtonLink to="/" variant="secondary" className="mt-16">
        Search for event
      </ButtonLink>
    </Container>
  );
}
