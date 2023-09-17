import { XMarkIcon } from '@heroicons/react/20/solid';

import { IconButton } from './IconButtons.tsx';
import { StoryBlock } from './StoryBlock.tsx';

export const Documentation = () => (
  <>
    <StoryBlock title="Variants">
      <IconButton label="Button label" icon={XMarkIcon} variant="primary" />
      <IconButton label="Button label" icon={XMarkIcon} variant="secondary" />
    </StoryBlock>

    <StoryBlock title="Sizes">
      <IconButton label="Button label" icon={XMarkIcon} size="m" />
      <IconButton label="Button label" icon={XMarkIcon} size="s" />
    </StoryBlock>
  </>
);
