import { useParams } from 'react-router';

import { SlashBarIcon } from '~/design-system/icons/slash-bar-icon.tsx';

import { EventsDropdown } from './dropdowns/events-dropdown.tsx';
import { TeamsDropdown } from './dropdowns/teams-dropdown.tsx';

type Props = {
  teams: Array<{
    slug: string;
    name: string;
    events: Array<{ slug: string; name: string; logoUrl: string | null; archived: boolean }>;
  }>;
};

export function TeamBreadcrumb({ teams }: Props) {
  const { team, event } = useParams();

  const currentTeam = teams.find(({ slug }) => slug === team);
  const currentEvent = currentTeam?.events?.find(({ slug }) => slug === event);

  return (
    <nav className="flex ml-4 items-center text-gray-200 text-sm font-semibold">
      <TeamsDropdown teams={teams} currentTeam={currentTeam} />

      {currentTeam && currentEvent ? (
        <>
          <SlashBarIcon className="hidden sm:flex h-4 w-4 fill-gray-500" />
          <EventsDropdown events={currentTeam.events} currentTeam={currentTeam} currentEvent={currentEvent} />
        </>
      ) : null}
    </nav>
  );
}
