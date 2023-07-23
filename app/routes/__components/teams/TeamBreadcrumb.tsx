import { ArrowTopRightOnSquareIcon, ChevronRightIcon, Square3Stack3DIcon } from '@heroicons/react/24/outline';

import { Avatar } from '~/design-system/Avatar';
import { Badge, BadgeDot } from '~/design-system/Badges';
import { Link } from '~/design-system/Links';
import type { CfpState, EventType, EventVisibility } from '~/routes/__types/event';

import { CfpElapsedTime } from '../cfp/CfpElapsedTime';

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
    <div className="flex flex-col items-center justify-between gap-4 pt-4 sm:flex-row sm:gap-8">
      <nav className="flex items-center gap-4">
        <Link to={`/team/${team.slug}`} variant="secondary" size="l" heading strong={!event} className="gap-2">
          <Square3Stack3DIcon className="h-6 w-6 text-gray-600" />
          {team.name}
        </Link>
        {event && (
          <>
            <ChevronRightIcon className="h-4 w-4 text-gray-900" />
            <Link
              to={`/team/${team.slug}`}
              target="_blank"
              variant="secondary"
              size="l"
              heading
              strong={!!event}
              className="gap-2"
            >
              <Avatar size="xs" picture={event.logo} name={event.name} square aria-hidden />
              {event.name}
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
          className="hidden sm:flex"
        />
      )}
    </div>
  );
}
