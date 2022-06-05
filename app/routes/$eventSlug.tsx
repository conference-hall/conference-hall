import { json, LoaderFunction } from '@remix-run/node';
import { Outlet, useCatch, useLoaderData, useOutletContext } from '@remix-run/react';
import { EventHeader } from '../components-app/EventHeader';
import { EventTabs } from '../components-app/EventTabs';
import { ButtonLink } from '../components-ui/Buttons';
import { Container } from '../components-ui/Container';
import { mapErrorToResponse } from '../services/errors';
import { EventData, getEvent } from '../services/events/event.server';

export const loader: LoaderFunction = async ({ params }) => {
  const slug = params.eventSlug;
  if (!slug) throw new Response('Event not found', { status: 404 })

  try {
    const event = await getEvent(slug);
    return json<EventData>(event);
  } catch (err) {
    mapErrorToResponse(err);
  }
}

export default function EventRoute() {
  const data = useLoaderData<EventData>();
  return (
    <>
      <EventHeader
        type={data.type}
        name={data.name}
        address={data.address}
        conferenceStart={data.conferenceStart}
        conferenceEnd={data.conferenceEnd}
      />
      <EventTabs slug={data.slug} type={data.type} cfpState={data.cfpState} surveyEnabled={data.surveyEnabled} />
      <Outlet context={data} />
    </>
  );
}

export function useEvent() {
  return useOutletContext<EventData>();
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <Container className="mt-8 px-8 py-32 text-center">
      <h1 className="text-8xl font-black text-indigo-400">{caught.status}</h1>
      <p className="mt-10 text-4xl font-bold text-gray-600">{caught.data}</p>
      <ButtonLink to="/search" variant="secondary" className="mt-16">
        Search for event
      </ButtonLink>
    </Container>
  );
}
