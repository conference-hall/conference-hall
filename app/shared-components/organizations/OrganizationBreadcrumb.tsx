import type { EventType, EventVisibility } from '~/schemas/event';
import { HomeIcon } from '@heroicons/react/20/solid';
import { ArrowTopRightOnSquareIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from '@remix-run/react';
import Badge from '~/design-system/Badges';
import { H1, H2 } from '~/design-system/Typography';

type Props = {
  title: string;
  organization: { name: string; slug: string; role: string };
  event?: {
    name: string;
    slug: string;
    type: EventType;
    visibility: EventVisibility;
  };
};

export default function OrganizationBreadcrumb({ title, organization, event }: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
      <H1 srOnly>{title}</H1>
      <H2>
        <Link to="/organizer" className="truncate hover:underline">
          <HomeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </Link>
        <ChevronRightIcon className="h-4 w-4 text-gray-600" />
        <Link to={`/organizer/${organization.slug}`} className="hover:underline">
          {organization.name}
        </Link>
        {event && (
          <>
            <ChevronRightIcon className="h-4 w-4 text-gray-600" />
            <Link to={`/${event.slug}`} target="_blank" className="flex items-center truncate hover:underline">
              {event.name}
              <ArrowTopRightOnSquareIcon className="ml-2 h-4 w-4" />
            </Link>
          </>
        )}
      </H2>
      <div className="flex items-center gap-2">
        {event ? (
          <>
            <Badge>{event.type.toLowerCase()}</Badge>
            <Badge color={event.visibility === 'PRIVATE' ? 'red' : 'green'}>{event.visibility.toLowerCase()}</Badge>
          </>
        ) : (
          <Badge>{organization.role.toLowerCase()}</Badge>
        )}
      </div>
    </div>
  );
}
