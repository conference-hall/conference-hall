import { StoryBlock } from './StoryBlock';
import { AlertError, AlertInfo } from './Alerts';

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
