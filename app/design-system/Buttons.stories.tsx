import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

import { Button } from './Buttons.tsx';
import { StoryBlock } from './StoryBlock.tsx';

export const Documentation = () => (
  <>
    <StoryBlock title="Variants">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
    </StoryBlock>

    <StoryBlock title="Sizes">
      <Button size="m">Medium</Button>
      <Button size="s">Small</Button>
    </StoryBlock>

    <StoryBlock title="Disabled">
      <Button disabled>Disabled</Button>
      <Button variant="secondary" disabled>
        Disabled
      </Button>
    </StoryBlock>

    <StoryBlock title="Loading">
      <Button loading>Loading</Button>
      <Button variant="secondary" loading>
        Loading
      </Button>
    </StoryBlock>

    <StoryBlock title="Icon left">
      <Button iconLeft={ArrowLeftIcon}>Icon left</Button>
      <Button variant="secondary" iconLeft={ArrowLeftIcon}>
        Secondary
      </Button>
      <Button variant="secondary" size="s" iconLeft={ArrowLeftIcon}>
        small
      </Button>
    </StoryBlock>

    <StoryBlock title="Icon right">
      <Button iconRight={ArrowRightIcon}>Icon left</Button>
      <Button variant="secondary" iconRight={ArrowRightIcon}>
        Secondary
      </Button>
      <Button variant="secondary" size="s" iconRight={ArrowRightIcon}>
        small
      </Button>
    </StoryBlock>

    <StoryBlock title="Block">
      <Button block>Block</Button>
    </StoryBlock>
  </>
);
