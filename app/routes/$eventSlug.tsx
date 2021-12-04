import { Outlet, useLoaderData } from 'remix';
import { Header } from '~/components/event/Header';
import { EventHeader, getEventHeader } from '../server/event/get-event-header.server';

export const loader = getEventHeader;

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
