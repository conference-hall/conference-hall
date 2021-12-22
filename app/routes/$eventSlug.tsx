import { Outlet, useCatch, useLoaderData } from 'remix';
import { ButtonLink } from '../components/Buttons';
import { Container } from '../components/layout/Container';
import { Header } from '../features/event-page/components/Header';
import { EventHeader, loadEventHeader } from '../features/event-page/event-header.server';

export const loader = loadEventHeader;

export default function EventRoute() {
  const data = useLoaderData<EventHeader>();
  return (
    <>
      <Header
        slug={data.slug}
        type={data.type}
        name={data.name}
        conferenceStart={data.conferenceStart}
        conferenceEnd={data.conferenceEnd}
        surveyEnabled={data.surveyEnabled}
      />
      <Outlet />
    </>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <Container className="mt-8 px-8 py-32 text-center">
      <h1 className="text-8xl font-black text-indigo-400">{caught.status}</h1>
      <p className="mt-10 text-4xl font-bold text-gray-600">{caught.data}</p>
      <ButtonLink to="/search" variant="secondary" className="mt-16">Find your event</ButtonLink>
    </Container>
  );
}
