import React from 'react';
import { CalendarIcon, LocationMarkerIcon } from '@heroicons/react/solid';
import { Link } from 'remix';
import { formatCFPState, formatEventType, CfpState } from '~/utils/event';
import { IconLabel } from '../ui/IconLabel';

type EventsListProps = { children: React.ReactNode };

export function EventsList({ children }: EventsListProps) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {children}
      </ul>
    </div>
  );
}

type EventsItemProps = {
  slug: string;
  name: string;
  type: 'CONFERENCE' | 'MEETUP';
  address: string | null;
  cfpState: CfpState;
};

export function EventItem({ slug, name, type, address, cfpState }: EventsItemProps) {
  return (
    <li>
      <Link to={`/${slug}`} className="block hover:bg-gray-50">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-indigo-600 truncate">{name}</p>
            <div className="ml-2 flex-shrink-0 flex">
              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                {formatEventType(type)}
              </p>
            </div>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <IconLabel icon={LocationMarkerIcon} className="mt-2 text-gray-500 sm:mt-0 sm:flex">{address}</IconLabel>
            <IconLabel icon={CalendarIcon} className="mt-2 text-gray-500 sm:mt-0">{formatCFPState(cfpState)}</IconLabel>
          </div>
        </div>
      </Link>
    </li>
  );
}
