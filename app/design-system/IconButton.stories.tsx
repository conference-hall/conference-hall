import { IconButton } from './IconButtons';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { StoryBlock } from './StoryBlock';

export const Documentation = () => (
  <>
    <StoryBlock title="Variants">
      <IconButton icon={MagnifyingGlassIcon} variant="primary" />
      <IconButton icon={MagnifyingGlassIcon} variant="secondary" />
    </StoryBlock>

    <StoryBlock title="Sizes">
      <IconButton icon={MagnifyingGlassIcon} size="xs" />
      <IconButton icon={MagnifyingGlassIcon} size="s" />
      <IconButton icon={MagnifyingGlassIcon} size="m" />
      <IconButton icon={MagnifyingGlassIcon} size="l" />
    </StoryBlock>

    <StoryBlock title="Disabled">
      <IconButton icon={MagnifyingGlassIcon} disabled />
    </StoryBlock>
  </>
);
