import { FireIcon } from '@heroicons/react/20/solid';

import { Button } from '../Buttons.tsx';
import { StoryBlock } from '../StoryBlock.tsx';
import { EmptyState } from './EmptyState.tsx';

export const Documentation = () => (
  <>
    <StoryBlock title="Default" variant="none">
      <EmptyState label="It's empty!" icon={FireIcon}>
        <Button size="s">Create</Button>
      </EmptyState>
    </StoryBlock>
  </>
);
