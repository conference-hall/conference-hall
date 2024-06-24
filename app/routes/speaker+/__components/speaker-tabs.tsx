import { FireIcon, MicrophoneIcon, UserIcon } from '@heroicons/react/24/outline';

import { Page } from '~/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';

type Props = { className?: string };

export function SpeakerTabs({ className }: Props) {
  return (
    <Page.NavHeader>
      <NavTabs py={4} scrollable className={className}>
        <NavTab to="/speaker" icon={FireIcon} end>
          Activity
        </NavTab>

        <NavTab to="/speaker/talks" icon={MicrophoneIcon}>
          Talks library
        </NavTab>

        <NavTab to="/speaker/profile" icon={UserIcon}>
          Speaker profile
        </NavTab>
      </NavTabs>
    </Page.NavHeader>
  );
}
