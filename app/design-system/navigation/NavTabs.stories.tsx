import { StoryBlock } from '../StoryBlock.tsx';
import { NavTab, NavTabs } from './NavTabs.tsx';

export const Documentation = () => (
  <>
    <StoryBlock title="Default">
      <NavTabs>
        <NavTab to={'/'}>Homepage</NavTab>
        <NavTab to={'/a'}>About</NavTab>
        <NavTab to={'/b'}>Contacts</NavTab>
        <NavTab to={'/c'}>Settings</NavTab>
      </NavTabs>
    </StoryBlock>

    <StoryBlock title="Dark" variant="dark">
      <NavTabs variant="dark">
        <NavTab to={'/'}>Homepage</NavTab>
        <NavTab to={'/a'}>About</NavTab>
        <NavTab to={'/b'}>Contacts</NavTab>
        <NavTab to={'/c'}>Settings</NavTab>
      </NavTabs>
    </StoryBlock>
  </>
);
