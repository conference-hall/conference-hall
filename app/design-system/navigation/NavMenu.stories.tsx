import { ArrowRightCircleIcon, CogIcon, UserCircleIcon } from '@heroicons/react/20/solid';
import { NavMenu } from './NavMenu';
import { StoryBlock } from '../StoryBlock';

export const Documentation = () => (
  <>
    <StoryBlock title="Default">
      <NavMenu
        items={[
          { to: '/', icon: UserCircleIcon, label: 'Profile' },
          { to: '/b', icon: CogIcon, label: 'Settings' },
          { to: '/c', icon: ArrowRightCircleIcon, label: 'Settings' },
        ]}
      />
    </StoryBlock>
  </>
);
