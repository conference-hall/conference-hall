import React from 'react';
import { LocationMarkerIcon } from '@heroicons/react/solid';
import { Link } from '@remix-run/react';
import { formatEventType, CfpState } from '~/utils/event';
import { IconLabel } from '../../../components/IconLabel';
import { CfpLabel } from '../../../components/event/CfpInfo';

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
    <li className="col-span-1 bg-white rounded-lg shadow">
      <Link to={`/${slug}`} className="block hover:bg-gray-50 rounded-lg">
        <div className="px-4 py-6 sm:px-6 h-40 flex flex-col justify-between">
          <div>
            <p className="truncate">
              <span className="text-base font-semibold text-indigo-600">{name}</span>
              <span className="text-xs text-gray-500"> · {formatEventType(type)}</span>
            </p>
            <IconLabel icon={LocationMarkerIcon} className="mt-2 text-gray-500" iconClassName="text-gray-400">
              {address}
            </IconLabel>
          </div>
          <CfpLabel cfpState={cfpState} className="mt-6" />
        </div>
      </Link>
    </li>
  );
}
