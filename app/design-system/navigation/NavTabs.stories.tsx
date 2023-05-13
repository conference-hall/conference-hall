import { StoryBlock } from '../StoryBlock';
import { NavTabs } from './NavTabs';

export const Documentation = () => (
  <>
    <StoryBlock title="Default">
      <NavTabs
        tabs={[
          { to: '/', label: 'Homepage', enabled: true },
          { to: '/a', label: 'About', enabled: true },
          { to: '/b', label: 'Contacts', enabled: true },
          { to: '/c', label: 'Settings', enabled: true },
        ]}
      />
    </StoryBlock>

    <StoryBlock title="Dark" variant="dark">
      <NavTabs
        tabs={[
          { to: '/', label: 'Homepage', enabled: true },
          { to: '/a', label: 'About', enabled: true },
          { to: '/b', label: 'Contacts', enabled: true },
          { to: '/c', label: 'Settings', enabled: true },
        ]}
        variant="dark"
      />
    </StoryBlock>
  </>
);
