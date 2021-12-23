import { Outlet, useCatch, useLoaderData, useOutletContext } from 'remix';
import { ButtonLink } from '../components/Buttons';
import { Container } from '../components/layout/Container';
import { Header } from '../features/event-page/components/Header';
import { EventTabs } from '../features/event-page/components/Tabs';
import { EventData, loadEvent } from '../features/event-page/event.server';

export const loader = loadEvent;

export default function EventRoute() {
  const data = useLoaderData<EventData>();
  return (
    <>
      <Header
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
