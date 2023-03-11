import { ExternalLink, Link } from './Links';
import { SunIcon } from '@heroicons/react/20/solid';
import { StoryBlock } from './StoryBlock';

export const Documentation = () => (
  <>
    <StoryBlock title="Internal link">
      <Link to="/">Simple internal link</Link>
    </StoryBlock>

    <StoryBlock title="External link">
      <ExternalLink href="https://conference-hall.io">Simple internal link</ExternalLink>
    </StoryBlock>

    <StoryBlock title="Link with icon">
      <Link to="/" icon={SunIcon}>
        Link with icon
      </Link>
    </StoryBlock>
  </>
);
