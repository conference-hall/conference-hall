import React from 'react';
import cn from 'classnames';
import { CalendarIcon, LocationMarkerIcon } from '@heroicons/react/solid';
import { IconLabel } from '../../../components/IconLabel';
import { formatConferenceDates } from '../../../utils/event';
import { NavLink } from 'remix';

type HeaderProps = {
  slug: string;
  name: string;
  address: string | null;
  conferenceStart?: string;
  conferenceEnd?: string;
};

export function Header({ slug, name, address, conferenceStart, conferenceEnd }: HeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="lg:flex lg:items-center lg:justify-between min-w-0 max-w-7xl mx-auto py-6 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl leading-6 font-bold text-gray-900">{name}</h1>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <IconLabel icon={LocationMarkerIcon} className="mt-2 text-gray-500">
              {address}
            </IconLabel>
            {!!conferenceStart && (
              <IconLabel icon={CalendarIcon} className="mt-2 text-gray-500">
                {formatConferenceDates(conferenceStart, conferenceEnd)}
              </IconLabel>
            )}
          </div>
        </div>
      </div>
      <div className="min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:block">
          <nav className="-mb-px flex space-x-8">
            <NavLink to={`/${slug}`} end className={activeTab}>
              Conference
            </NavLink>
            <NavLink to={`/${slug}/proposals`} className={activeTab}>
              Your proposals
            </NavLink>
            <NavLink to={`/${slug}/submission`} className={activeTab}>
              Submission
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}

const activeTab = ({ isActive }: { isActive: boolean }) => {
  return cn('whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm', {
    'border-indigo-500 text-indigo-600': isActive,
    'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': !isActive,
  });
};
