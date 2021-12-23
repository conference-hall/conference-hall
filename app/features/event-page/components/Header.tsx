import React from 'react';
import { CalendarIcon, LocationMarkerIcon } from '@heroicons/react/solid';
import { IconLabel } from '../../../components/IconLabel';
import { formatConferenceDates } from '../../../utils/event';

type HeaderProps = {
  type: 'CONFERENCE' | 'MEETUP';
  name: string;
  address: string | null;
  conferenceStart?: string;
  conferenceEnd?: string;
};

export function Header({ name, type, address, conferenceStart, conferenceEnd }: HeaderProps) {
  return (
    <header className="bg-white border-t border-gray-200">
      <div className="lg:flex lg:items-center lg:justify-between min-w-0 max-w-7xl mx-auto py-10 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl leading-6 font-bold text-gray-900">{name}</h1>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
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
