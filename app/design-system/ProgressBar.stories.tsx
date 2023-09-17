import { ProgressBar } from './ProgressBar.tsx';
import { StoryBlock } from './StoryBlock.tsx';

export const Documentation = () => (
  <>
    <StoryBlock title="Default" vertical>
      <ProgressBar value={1} max={3} />
    </StoryBlock>
  </>
);
