import { Card, CardLink } from './Card';
import { StoryBlock } from '../StoryBlock';

export const Documentation = () => (
  <>
    <StoryBlock title="Default card">
      <Card className="p-4">
        This is a <code>Card</code>
      </Card>
    </StoryBlock>

    <StoryBlock title="Clickable link card">
      <CardLink to="/" className="p-4">
        This is a <code>CardLink</code>
      </CardLink>
    </StoryBlock>
  </>
);
