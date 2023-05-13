import { ArrowRightCircleIcon, CogIcon, UserCircleIcon } from '@heroicons/react/20/solid';

import { StoryBlock } from '../StoryBlock';
import { NavSideMenu } from './NavSideMenu';

export const Documentation = () => (
  <>
    <StoryBlock title="Default">
      <NavSideMenu
        items={[
          { to: '/', icon: UserCircleIcon, label: 'Profile' },
          { to: '/b', icon: CogIcon, label: 'Settings' },
          { to: '/c', icon: ArrowRightCircleIcon, label: 'Settings' },
        ]}
      />
    </StoryBlock>
  </>
);
