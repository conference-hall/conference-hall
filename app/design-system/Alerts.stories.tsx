import { StoryBlock } from './StoryBlock';
import { AlertInfo, AlertSuccess } from './Alerts';

export const Documentation = () => (
  <>
    <StoryBlock title="AlertSuccess">
      <AlertSuccess>This is a success</AlertSuccess>
    </StoryBlock>

    <StoryBlock title="AlertInfo">
      <AlertInfo>This is an info</AlertInfo>
    </StoryBlock>
  </>
);
