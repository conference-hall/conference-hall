import { FireIcon } from '@heroicons/react/20/solid';

import { Button } from '../Buttons';
import { StoryBlock } from '../StoryBlock';
import { EmptyState } from './EmptyState';

export const Documentation = () => (
  <>
    <StoryBlock title="Default">
      <EmptyState label="It's empty!" icon={FireIcon}>
        <Button size="s">Create</Button>
      </EmptyState>
    </StoryBlock>
  </>
);
