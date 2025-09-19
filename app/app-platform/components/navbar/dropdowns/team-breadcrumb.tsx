import { useParams } from 'react-router';
import { SlashBarIcon } from '~/design-system/icons/slash-bar-icon.tsx';
import { LogoButton } from '../buttons/logo-button.tsx';
import { EventsDropdown } from './events-dropdown.tsx';
import { TeamsDropdown } from './teams-dropdown.tsx';

type Props = {
  teams: Array<{
    slug: string;
    name: string;
    events: Array<{ slug: string; name: string; logoUrl: string | null; archived: boolean }>;
  }>;
};

export function TeamBreadcrumb({ teams }: Props) {
  const { event } = useParams();

  return (
    <nav className="flex items-center text-gray-200 text-sm font-semibold">
      <LogoButton hideLabel className="mr-2" />
      <TeamsDropdown teams={teams} />
      {event ? <SlashBarIcon className="hidden sm:flex h-4 w-4 fill-gray-500" /> : null}
      {event ? <EventsDropdown teams={teams} /> : null}
    </nav>
  );
}
