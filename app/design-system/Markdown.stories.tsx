import { Markdown } from './Markdown';
import { StoryBlock } from './StoryBlock';

const TEXT = `
## Heading  

It is rendered with **Marked**.

> And it's sanitized against XSS attacks
`;

export const Documentation = () => (
  <>
    <StoryBlock title="Default">
      <Markdown source={TEXT} />
    </StoryBlock>

    <StoryBlock title="Medium sized text">
      <Markdown source={TEXT} size="m" />
    </StoryBlock>
  </>
);
