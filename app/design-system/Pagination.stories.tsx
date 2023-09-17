import { Pagination } from './Pagination.tsx';
import { StoryBlock } from './StoryBlock.tsx';

export const Documentation = () => (
  <>
    <StoryBlock title="Default" vertical>
      <Pagination current={1} total={10} />
    </StoryBlock>
  </>
);
