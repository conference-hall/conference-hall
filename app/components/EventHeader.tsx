import { CalendarIcon, LocationMarkerIcon } from '@heroicons/react/solid';
import { IconLabel } from '../design-system/IconLabel';
import { formatConferenceDates } from '../utils/event';

type Props = {
  type: 'CONFERENCE' | 'MEETUP';
  name: string;
  address: string | null;
  conferenceStart?: string;
  conferenceEnd?: string;
};

export function EventHeader({ name, type, address, conferenceStart, conferenceEnd }: Props) {
  return (
    <header className="bg-white">
      <div className="mx-auto min-w-0 max-w-7xl py-10 px-4 pb-4 sm:px-6 lg:flex lg:items-center lg:justify-between lg:px-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">{name}</h1>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            {address && (
              <IconLabel icon={LocationMarkerIcon} className="mt-2 text-gray-500">
                {address}
              </IconLabel>
            )}
            <IconLabel icon={CalendarIcon} className="mt-2 text-gray-500">
              {formatConferenceDates(type, conferenceStart, conferenceEnd)}
            </IconLabel>
          </div>
        </div>
      </div>
    </header>
  );
}
