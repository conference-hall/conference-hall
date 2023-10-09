import { StoryBlock } from './StoryBlock.tsx';
import { H1, H2, H3, Subtitle, Text } from './Typography.tsx';

export const Documentation = () => (
  <>
    <StoryBlock title="Typography" vertical>
      <H1>Heading level 1</H1>
      <H2>Heading level 2</H2>
      <H3>Heading level 3</H3>
      <Text variant="primary">Text primary</Text>
      <Text variant="secondary">Text secondary</Text>
      <Text variant="link">Text link</Text>
      <Text variant="warning">Text warning</Text>
      <Text variant="error">Text error</Text>
      <Subtitle>Subtitle</Subtitle>
    </StoryBlock>

    <StoryBlock title="Text weight" vertical>
      <Text weight="normal">Text normal</Text>
      <Text weight="medium">Text medium</Text>
      <Text weight="semibold">Text semibold</Text>
      <Text weight="bold">Text bold</Text>
    </StoryBlock>

    <StoryBlock title="Text sizes" vertical>
      <Text size="4xl">Text 4XL</Text>
      <Text size="3xl">Text 3XL</Text>
      <Text size="2xl">Text 2XL</Text>
      <Text size="xl">Text XL</Text>
      <Text size="l">Text large</Text>
      <Text size="base">Text medium</Text>
      <Text size="s">Text small</Text>
      <Text size="xs">Text extra small</Text>
    </StoryBlock>
  </>
);
