import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

import { StoryBlock } from '../StoryBlock.tsx';
import { Input } from './Input.tsx';

export const Documentation = () => (
  <>
    <StoryBlock title="Default" vertical>
      <Input label="First name" />
      <Input placeholder="Search" aria-label="Search" />
      <Input placeholder="Search" description="With description" />
      <Input placeholder="Search" error="Invalid" value="bad" />
      <Input placeholder="Search" icon={MagnifyingGlassIcon} />
      <Input addon="https://conference-hall.io" />
    </StoryBlock>

    <StoryBlock title="Default" vertical>
      <Input label="First name" size="l" />
      <Input placeholder="Search" aria-label="Search" size="l" />
      <Input placeholder="Search" description="With description" size="l" />
      <Input placeholder="Search" error="Invalid" value="bad" size="l" />
      <Input placeholder="Search" icon={MagnifyingGlassIcon} size="l" />
      <Input addon="https://conference-hall.io" size="l" />
    </StoryBlock>

    <StoryBlock title="Dark" vertical variant="dark">
      <Input label="First name" color="dark" />
      <Input placeholder="Search" aria-label="Search" color="dark" />
      <Input placeholder="Search" description="With description" color="dark" />
      <Input placeholder="Search" error="Invalid" value="bad" color="dark" />
      <Input placeholder="Search" icon={MagnifyingGlassIcon} color="dark" />
      <Input addon="https://conference-hall.io" color="dark" />
    </StoryBlock>
  </>
);
