import { AlertError, AlertInfo } from './Alerts.tsx';
import { StoryBlock } from './StoryBlock.tsx';

export const Documentation = () => (
  <>
    <StoryBlock title="AlertInfo">
      <AlertInfo>This is an info</AlertInfo>
    </StoryBlock>

    <StoryBlock title="AlertError">
      <AlertError>This is an error</AlertError>
    </StoryBlock>
  </>
);
