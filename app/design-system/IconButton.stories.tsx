import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

import { IconButton } from './IconButtons';
import { StoryBlock } from './StoryBlock';

export const Documentation = () => (
  <>
    <StoryBlock title="Variants">
      <IconButton label="Button label" icon={MagnifyingGlassIcon} variant="primary" />
      <IconButton label="Button label" icon={MagnifyingGlassIcon} variant="secondary" />
    </StoryBlock>

    <StoryBlock title="Sizes">
      <IconButton label="Button label" icon={MagnifyingGlassIcon} size="xs" />
      <IconButton label="Button label" icon={MagnifyingGlassIcon} size="s" />
      <IconButton label="Button label" icon={MagnifyingGlassIcon} size="m" />
      <IconButton label="Button label" icon={MagnifyingGlassIcon} size="l" />
    </StoryBlock>
  </>
);
