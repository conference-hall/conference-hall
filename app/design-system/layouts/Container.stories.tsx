import { StoryBlock } from '../StoryBlock.tsx';
import { Container } from './Container.tsx';

export const Documentation = () => (
  <>
    <StoryBlock title="Default">
      <Container className="bg-gray-300">This is a container</Container>
    </StoryBlock>
  </>
);
