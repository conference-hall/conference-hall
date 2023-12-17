import { ArrowTopRightOnSquareIcon, ChevronRightIcon, Square3Stack3DIcon } from '@heroicons/react/24/outline';

import type { CfpState } from '~/.server/shared/CallForPaper.ts';
import type { EventType, EventVisibility } from '~/.server/shared/Event.types.ts';
import { Avatar } from '~/design-system/Avatar.tsx';
import { Badge, BadgeDot } from '~/design-system/Badges.tsx';
import { Link } from '~/design-system/Links.tsx';

import { CfpElapsedTime } from '../cfp/CfpElapsedTime.tsx';

type Props = {
  team: { name: string; slug: string; role: string };
  event?: {
    name: string;
    slug: string;
    logo: string | null;
    type: EventType;
    visibility: EventVisibility;
    cfpState: CfpState;
    cfpStart?: string;
    cfpEnd?: string;
  };
};

export default function TeamBreadcrumb({ team, event }: Props) {
  return (
    <div className="flex justify-between gap-4 pt-4">
      <nav className="flex items-center gap-2 lg:gap-4 truncate">
        <Link
          to={`/team/${team.slug}`}
          variant="secondary"
          size="l"
          weight={event ? 'medium' : 'bold'}
          truncate
          className="gap-2"
        >
          <Square3Stack3DIcon className="h-6 w-6 text-gray-600" />
          <span className="truncate">{team.name}</span>
        </Link>
        {event && (
          <>
            <ChevronRightIcon className="h-4 w-4 text-gray-900" />
            <Link
              to={`/${event.slug}`}
              target="_blank"
              variant="secondary"
              size="l"
              weight={event ? 'bold' : 'medium'}
              truncate
              className="gap-2"
            >
              <Avatar size="xs" picture={event.logo} name={event.name} square aria-hidden />
              <span className="truncate">{event.name}</span>
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </Link>
          </>
        )}
        {event ? (
          <BadgeDot color={event.visibility === 'PRIVATE' ? 'red' : 'green'}>{event.visibility.toLowerCase()}</BadgeDot>
        ) : (
          <Badge>{team.role.toLowerCase()}</Badge>
        )}
      </nav>
      {event && (
        <CfpElapsedTime
          cfpState={event.cfpState}
          cfpStart={event.cfpStart}
          cfpEnd={event.cfpEnd}
          className="hidden md:flex"
        />
      )}
    </div>
  );
}
