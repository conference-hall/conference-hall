import { Outlet, useLoaderData } from 'remix';
import { Header } from '../features/event-page/components/Header';
import { EventHeader, loadEventHeader } from '../features/event-page/event-header.server';

export const loader = loadEventHeader;

export default function EventRoute() {
  const data = useLoaderData<EventHeader>();
  return (
    <>
      <Header
        name={data.name}
        address={data.address}
        conferenceStart={data.conferenceStart}
        conferenceEnd={data.conferenceEnd}
      />
      <Outlet />
    </>
  );
}
