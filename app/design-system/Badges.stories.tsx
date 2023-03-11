import { StoryBlock } from './StoryBlock';
import Badge from './Badges';

export const Documentation = () => (
  <>
    <StoryBlock title="Badge colors">
      <Badge color="gray">gray</Badge>
      <Badge color="red">red</Badge>
      <Badge color="yellow">yellow</Badge>
      <Badge color="green">green</Badge>
      <Badge color="blue">blue</Badge>
      <Badge color="indigo">indigo</Badge>
      <Badge color="purple">purple</Badge>
      <Badge color="pink">pink</Badge>
    </StoryBlock>

    <StoryBlock title="Badge rounded">
      <Badge rounded={false}>gray</Badge>
    </StoryBlock>

    <StoryBlock title="Badge sizes">
      <Badge size="large">large</Badge>
      <Badge size="base">base</Badge>
    </StoryBlock>
  </>
);
