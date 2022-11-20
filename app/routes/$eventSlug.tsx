import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useCatch, useLoaderData, useOutletContext } from '@remix-run/react';
import { EventHeader } from '~/components/EventHeader';
import { EventTabs } from '~/components/EventTabs';
import { Navbar } from '~/components/navbar/Navbar';
import { ButtonLink } from '~/design-system/Buttons';
import { Container } from '~/design-system/Container';
import { mapErrorToResponse } from '~/services/errors';
import { getEvent } from '~/services/events/get-event.server';

export const loader = async ({ params }: LoaderArgs) => {
  const slug = params.eventSlug;
  if (!slug) throw new Response('Event not found', { status: 404 });

  try {
    const event = await getEvent(slug);
    return json(event);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function EventRoute() {
  const event = useLoaderData<typeof loader>();

  return (
    <>
      <Navbar />
      <EventHeader
        type={event.type}
        name={event.name}
        address={event.address}
        conferenceStart={event.conferenceStart}
        conferenceEnd={event.conferenceEnd}
      />
      <EventTabs slug={event.slug} type={event.type} cfpState={event.cfpState} surveyEnabled={event.surveyEnabled} />
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
