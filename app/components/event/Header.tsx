import React from 'react'
import { CalendarIcon, LocationMarkerIcon } from '@heroicons/react/solid';
import { formatConferenceDates } from '../../utils/event';
import { IconLabel } from '../ui/IconLabel';

type HeaderProps = { name: string; address: string | null; conferenceStart?: string; conferenceEnd?: string };

export function Header({ name, address, conferenceStart, conferenceEnd }: HeaderProps) {
  return (
    <header className="bg-indigo-900 pb-28">
      <div className="lg:flex lg:items-center lg:justify-between min-w-0 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold leading-tight text-white">{name}</h1>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <IconLabel icon={LocationMarkerIcon} className="mt-2 text-indigo-100">
              {address}
            </IconLabel>
            {!!conferenceStart && (
              <IconLabel icon={CalendarIcon} className="mt-2 text-indigo-100">
                {formatConferenceDates(conferenceStart, conferenceEnd)}
              </IconLabel>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
