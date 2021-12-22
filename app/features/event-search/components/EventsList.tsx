import React from 'react';
import { LocationMarkerIcon } from '@heroicons/react/solid';
import { Link } from 'remix';
import { formatCFPState, formatEventType, CfpState } from '~/utils/event';
import { IconLabel } from '../../../components/IconLabel';

type EventsListProps = { children: React.ReactNode };

export function EventsList({ children }: EventsListProps) {
  return (
    <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </ul>
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
    <li className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200">
      <Link to={`/${slug}`} className="block hover:bg-indigo-50 rounded-lg">
        <div className="px-4 py-6 sm:px-6">
          <p className="text-sm font-medium truncate">
            <span className="text-base font-semibold text-indigo-600">{name}</span>
            <span className="text-xs text-gray-500"> · {formatEventType(type)}</span>
          </p>
          <IconLabel icon={LocationMarkerIcon} className="mt-2 text-gray-500" iconClassName="text-gray-400">
            {address}
          </IconLabel>
          <div className="mt-6 flex items-center space-x-3">
            <span className="h-4 w-4 bg-green-100 rounded-full flex items-center justify-center" aria-hidden="true">
              <span className="h-2 w-2 bg-green-400 rounded-full"></span>
            </span>
            <span className="block text-sm font-semibold">{formatCFPState(cfpState)}</span>
          </div>
        </div>
      </Link>
    </li>
  );
}
