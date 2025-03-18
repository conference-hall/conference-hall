import { PlusIcon } from '@heroicons/react/20/solid';
import { Cog6ToothIcon, FireIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { href } from 'react-router';

import { ButtonLink } from '~/design-system/buttons.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';

type Props = { className?: string };

export function SpeakerTabs({ className }: Props) {
  return (
    <Page.NavHeader className="flex flex-col pb-2 sm:pb-0 sm:flex-row sm:items-center sm:space-between">
      <NavTabs py={4} scrollable className={cx('grow', className)}>
        <NavTab to={href('/speaker')} icon={FireIcon} end>
          Activity
        </NavTab>

        <NavTab to={href('/speaker/talks')} icon={MicrophoneIcon}>
          Talks library
        </NavTab>

        <NavTab to={href('/speaker/settings')} icon={Cog6ToothIcon}>
          Settings
        </NavTab>
      </NavTabs>

      <ButtonLink to={href('/speaker/talks/new')} iconLeft={PlusIcon}>
        New talk
      </ButtonLink>
    </Page.NavHeader>
  );
}
