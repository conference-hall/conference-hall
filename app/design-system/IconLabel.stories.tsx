import { IconLabel } from './IconLabel';
import { CogIcon, MagnifyingGlassIcon, TvIcon } from '@heroicons/react/20/solid';
import { StoryBlock } from './StoryBlock';

export const Documentation = () => (
  <>
    <StoryBlock title="Variants">
      <IconLabel icon={MagnifyingGlassIcon}>Icon with label</IconLabel>
    </StoryBlock>

    <StoryBlock title="Truncate label">
      <IconLabel icon={TvIcon} truncate className="w-80">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus
      </IconLabel>
    </StoryBlock>

    <StoryBlock title="Label clamp">
      <IconLabel icon={CogIcon} lineCamp className="w-80">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit
        amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a,
        semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum
        diam nisl sit amet erat.
      </IconLabel>
    </StoryBlock>
  </>
);
