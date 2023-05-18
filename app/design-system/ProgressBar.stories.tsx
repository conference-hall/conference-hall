import { ProgressBar } from './ProgressBar';
import { StoryBlock } from './StoryBlock';

export const Documentation = () => (
  <>
    <StoryBlock title="Default" vertical>
      <ProgressBar value={1} max={3} />
    </StoryBlock>
  </>
);
