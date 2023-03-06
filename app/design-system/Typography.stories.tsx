import { StoryBlock } from './StoryBlock';
import { H1, H2, H3, Text } from './Typography';

export const Documentation = () => (
  <>
    <StoryBlock title="Headings" vertical>
      <H1>Heading level 1</H1>
      <H2>Heading level 2</H2>
      <H3>Heading level 3</H3>
    </StoryBlock>

    <StoryBlock title="Text variants" vertical>
      <Text>Text primary</Text>
      <Text variant="secondary">Text secondary</Text>
      <Text variant="link">Text link</Text>
      <Text variant="warning">Text warning</Text>
      <Text variant="error">Text error</Text>
    </StoryBlock>

    <StoryBlock title="Text sizes" vertical>
      <Text size="xl">Text extra large</Text>
      <Text size="l">Text large</Text>
      <Text size="m">Text medium</Text>
      <Text size="s">Text small</Text>
      <Text size="xs">Text extra small</Text>
    </StoryBlock>
  </>
);
