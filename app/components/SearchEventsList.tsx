import { MapPinIcon } from '@heroicons/react/20/solid';
import { CardLink } from '~/design-system/Card';
import type { CfpState } from '~/utils/event';
import { formatEventType } from '~/utils/event';
import { IconLabel } from '../design-system/IconLabel';
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
    <ul aria-label="Search results" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <CardLink
          as="li"
          key={event.slug}
          to={forTalkId ? `/${event.slug}/submission/${forTalkId}` : `/${event.slug}`}
          className="flex h-40 flex-col justify-between p-4"
        >
          <div>
            <p className="truncate">
              <span className="text-base font-semibold text-indigo-600">{event.name}</span>
              <span className="text-xs text-gray-500"> · {formatEventType(event.type)}</span>
            </p>
            <IconLabel icon={MapPinIcon} className="mt-2 text-gray-500" iconClassName="text-gray-400" lineCamp>
              {event.address}
            </IconLabel>
          </div>
          <CfpLabel cfpState={event.cfpState} />
        </CardLink>
      ))}
    </ul>
  );
}
