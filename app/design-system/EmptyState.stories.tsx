import { FireIcon } from '@heroicons/react/20/solid';
import { EmptyState } from './EmptyState';
import { StoryBlock } from './StoryBlock';
import { Button } from './Buttons';

export const Documentation = () => (
  <>
    <StoryBlock title="Default">
      <EmptyState label="It's empty!" icon={FireIcon}>
        <Button size="s">Create</Button>
      </EmptyState>
    </StoryBlock>
  </>
);
