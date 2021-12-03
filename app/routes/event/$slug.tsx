import { CalendarIcon,LocationMarkerIcon } from '@heroicons/react/solid';
import { Outlet, useLoaderData } from 'remix';
import { IconLabel } from '~/components/IconLabel';
import { EventInfo, getEventInfo } from '~/server/event/get-event-info.server';

export const loader = getEventInfo;

export default function EventRoute() {
  const data = useLoaderData<EventInfo>();
  return (
    <>
      <header className="bg-indigo-900 pb-28">
        <div className="lg:flex lg:items-center lg:justify-between min-w-0 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold leading-tight text-white">{data.name}</h1>
            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <IconLabel icon={LocationMarkerIcon} className="mt-2 text-indigo-100">
                {data.address}
              </IconLabel>
              <IconLabel icon={CalendarIcon} className="mt-2 text-indigo-100">
                2 days conference - 29-28 oct. 2021
              </IconLabel>
            </div>
          </div>
        </div>
      </header>
      <Outlet />
    </>
  );
}
