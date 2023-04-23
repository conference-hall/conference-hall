import { Card, CardLink } from './Card';
import { StoryBlock } from '../StoryBlock';
import { H2, Text } from '../Typography';
import { Button } from '../Buttons';

export const Documentation = () => (
  <>
    <StoryBlock title="Default card" variant="none">
      <Card p={4}>
        This is a <code>Card</code>
      </Card>
    </StoryBlock>

    <StoryBlock title="Card link" variant="none">
      <CardLink to="/" p={4}>
        This is a <code>CardLink</code>
      </CardLink>
    </StoryBlock>

    <StoryBlock title="Card panel" variant="none">
      <Card>
        <Card.Title>
          <H2>Hello world</H2>
        </Card.Title>
        <Card.Content>
          <Text>Do you want to enter to a new world?</Text>
        </Card.Content>
        <Card.Actions>
          <Button variant="secondary">No</Button>
          <Button>Yes</Button>
        </Card.Actions>
      </Card>
    </StoryBlock>
  </>
);
