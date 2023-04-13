import type { CfpState, EventType, EventVisibility } from '~/schemas/event';
import { ArrowTopRightOnSquareIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from '@remix-run/react';
import Badge from '~/design-system/Badges';
import { Text } from '~/design-system/Typography';
import { Avatar } from '~/design-system/Avatar';
import { CfpElapsedTime } from '../cfp/CfpElapsedTime';

type Props = {
  organization: { name: string; slug: string; role: string };
  event?: {
    name: string;
    slug: string;
    bannerUrl: string | null;
    type: EventType;
    visibility: EventVisibility;
    cfpState: CfpState;
    cfpStart?: string;
    cfpEnd?: string;
  };
};

export default function OrganizationBreadcrumb({ organization, event }: Props) {
  return (
    <div className="flex flex-col gap-4 py-6 sm:flex-row sm:gap-8">
      <nav className="flex items-center gap-4">
        <Link to={`/organizer/${organization.slug}`} className="truncate hover:underline">
          <Text as="span" size="l" heading strong={!event}>
            {organization.name}
          </Text>
        </Link>
        {event && (
          <>
            <ChevronRightIcon className="h-4 w-4 text-gray-900" />
            <Link to={`/${event.slug}`} target="_blank" className="flex items-center gap-2 truncate hover:underline">
              <Avatar size="xs" photoURL={event.bannerUrl} square aria-hidden />
              <Text as="span" size="l" heading strong={!!event}>
                {event.name}
              </Text>
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </Link>
          </>
        )}
      </nav>
      <div className="flex items-center gap-2">
        {event ? <Badge>{event.visibility.toLowerCase()}</Badge> : <Badge>{organization.role.toLowerCase()}</Badge>}
      </div>
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
