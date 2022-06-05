import { LocationMarkerIcon } from '@heroicons/react/solid';
import { Link } from '@remix-run/react';
import { formatEventType, CfpState } from '~/utils/event';
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
    <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <li key={event.slug} className="col-span-1 bg-white rounded-lg border border-gray-200">
          <Link
            to={forTalkId ? `/${event.slug}/submission/${forTalkId}` : `/${event.slug}`}
            className="block hover:bg-gray-50 rounded-lg"
          >
            <div className="px-4 py-6 sm:px-6 h-40 flex flex-col justify-between">
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
