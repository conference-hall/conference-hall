import { NavTabs } from './NavTabs';
import { StoryBlock } from './StoryBlock';

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
  </>
);
