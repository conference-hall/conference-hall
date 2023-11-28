import { StoryBlock } from '../StoryBlock.tsx';
import { Pagination } from './Pagination.tsx';

export const Documentation = () => (
  <>
    <StoryBlock title="Default" vertical>
      <Pagination current={1} total={10} />
    </StoryBlock>
  </>
);
