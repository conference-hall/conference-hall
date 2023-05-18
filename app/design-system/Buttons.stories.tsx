import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { action, type Story } from '@ladle/react';

import { Button, type ButtonProps } from './Buttons';
import { StoryBlock } from './StoryBlock';

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

export const Playground: Story<ButtonProps> = ({ variant, size, disabled, block }) => (
  <Button variant={variant} size={size} disabled={disabled} block={block} onClick={action('onClick')}>
    Button
  </Button>
);

Playground.argTypes = {
  variant: {
    options: ['primary', 'secondary'],
    control: { type: 'inline-radio' },
    defaultValue: 'primary',
  },
  size: {
    options: ['s', 'm', 'l'],
    control: { type: 'inline-radio' },
    defaultValue: 'm',
  },
  disabled: {
    options: [true, false],
    control: { type: 'inline-radio' },
    defaultValue: false,
  },
  block: {
    options: [true, false],
    control: { type: 'inline-radio' },
    defaultValue: false,
  },
};
