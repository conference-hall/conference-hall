import { SunIcon } from '@heroicons/react/20/solid';

import { ExternalLink, Link } from './Links.tsx';
import { StoryBlock } from './StoryBlock.tsx';

export const Documentation = () => (
  <>
    <StoryBlock title="Internal link">
      <Link to="/">Primary internal link</Link>
      <Link to="/" variant="secondary">
        Secondary internal link
      </Link>
    </StoryBlock>

    <StoryBlock title="External link">
      <ExternalLink href="https://conference-hall.io">Primary internal link</ExternalLink>
      <ExternalLink href="https://conference-hall.io" variant="secondary">
        Secondary internal link
      </ExternalLink>
    </StoryBlock>

    <StoryBlock title="Link with icon">
      <Link to="/" icon={SunIcon}>
        Link with icon
      </Link>
    </StoryBlock>

    <StoryBlock title="With typography props">
      <Link to="/" size="base" heading strong>
        Can be updated with typography props
      </Link>
    </StoryBlock>
  </>
);
