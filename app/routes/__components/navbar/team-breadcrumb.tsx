import { useRouteLoaderData } from '@remix-run/react';

import { SlashBarIcon } from '~/design-system/icons/slash-bar-icon.tsx';

import type { loader as routeEventLoader } from '../../team+/$team.$event+/_layout.tsx';
import type { loader as routeTeamLoader } from '../../team+/$team.tsx';
import { EventButton } from './dropdowns/event-button.tsx';
import { TeamsDropdown } from './dropdowns/teams-dropdown.tsx';

type Props = {
  teams: Array<{ slug: string; name: string }>;
};

export function TeamBreadcrumb({ teams }: Props) {
  const currentTeam = useRouteLoaderData<typeof routeTeamLoader>('routes/team+/$team');
  const event = useRouteLoaderData<typeof routeEventLoader>('routes/team+/$team.$event+/_layout');

  return (
    <nav className="flex ml-4 items-center text-gray-200 text-sm font-semibold">
      <TeamsDropdown teams={teams} currentTeamSlug={currentTeam?.slug} />
      {currentTeam && event ? (
        <>
          <SlashBarIcon className="hidden sm:flex h-4 w-4 fill-gray-500" />
          <EventButton currentTeamSlug={currentTeam.slug} event={event} />
        </>
      ) : null}
    </nav>
  );
}
