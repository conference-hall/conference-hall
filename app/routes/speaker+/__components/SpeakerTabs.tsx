import { FireIcon, MicrophoneIcon, Square3Stack3DIcon, UserIcon } from '@heroicons/react/24/outline';

import { NavTab, NavTabs } from '~/design-system/navigation/NavTabs.tsx';

type Props = { isOrganizer?: boolean };

export function SpeakerTabs({ isOrganizer }: Props) {
  return (
    <NavTabs py={4} scrollable className="sm:ml-40">
      <NavTab to="/speaker" icon={FireIcon} end>
        Activity
      </NavTab>

      <NavTab to="/speaker/talks" icon={MicrophoneIcon}>
        Talks library
      </NavTab>

      <NavTab to="/speaker/profile" icon={UserIcon}>
        My profile
      </NavTab>

      {isOrganizer ? (
        <NavTab to="/speaker/teams" icon={Square3Stack3DIcon}>
          My teams
        </NavTab>
      ) : null}
    </NavTabs>
  );
}
