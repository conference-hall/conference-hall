import { AlertError, AlertInfo } from './Alerts';
import { StoryBlock } from './StoryBlock';

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
