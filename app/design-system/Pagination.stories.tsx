import { Pagination } from './Pagination';
import { StoryBlock } from './StoryBlock';

export const Documentation = () => (
  <>
    <StoryBlock title="Default" vertical>
      <Pagination pathname="/" current={1} total={10} />
    </StoryBlock>
  </>
);
