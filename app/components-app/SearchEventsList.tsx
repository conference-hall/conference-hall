import { LocationMarkerIcon } from '@heroicons/react/solid';
import { Link } from '@remix-run/react';
import type { CfpState } from '~/utils/event';
import { formatEventType } from '~/utils/event';
import { IconLabel } from '../components-ui/IconLabel';
import { CfpLabel } from './CfpInfo';

type Props = {
  events: Array<{
    slug: string;
    name: string;
    type: 'CONFERENCE' | 'MEETUP';
    address: string | null;
    cfpState: CfpState;
  }>;
  forTalkId: string | null;
};

export function SearchEventsList({ events, forTalkId }: Props) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <li key={event.slug} className="col-span-1 rounded-lg border border-gray-200 bg-white">
          <Link
            to={forTalkId ? `/${event.slug}/submission/${forTalkId}` : `/${event.slug}`}
            className="block rounded-lg hover:bg-gray-50"
          >
            <div className="flex h-40 flex-col justify-between px-4 py-6 sm:px-6">
              <div>
                <p className="truncate">
                  <span className="text-base font-semibold text-indigo-600">{event.name}</span>
                  <span className="text-xs text-gray-500"> · {formatEventType(event.type)}</span>
                </p>
                <IconLabel icon={LocationMarkerIcon} className="mt-2 text-gray-500" iconClassName="text-gray-400">
                  {event.address}
                </IconLabel>
              </div>
              <CfpLabel cfpState={event.cfpState} className="mt-6" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
