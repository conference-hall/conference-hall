import { action, type Story } from '@ladle/react';

import { Button, type ButtonProps } from './Buttons';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { StoryBlock } from './StoryBlock';

export const Documentation = () => (
  <>
    <StoryBlock title="Variants">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
    </StoryBlock>

    <StoryBlock title="Sizes">
      <Button size="s">Small</Button>
      <Button size="m">Medium</Button>
      <Button size="l">Large</Button>
    </StoryBlock>

    <StoryBlock title="Other states">
      <Button disabled>Disabled</Button>
      <Button rounded>Rounded</Button>
      <Button loading>Loading</Button>
    </StoryBlock>

    <StoryBlock title="Icons">
      <Button iconLeft={MagnifyingGlassIcon}>Icon left</Button>
      <Button iconRight={MagnifyingGlassIcon}>Icon right</Button>
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
