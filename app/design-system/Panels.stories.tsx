import { SectionPanel } from './Panels';
import { StoryBlock } from './StoryBlock';

export const Documentation = () => (
  <>
    <StoryBlock title="Default">
      <SectionPanel id="1" title="Section">
        This is a section
      </SectionPanel>
    </StoryBlock>

    <StoryBlock title="With padding">
      <SectionPanel id="1" title="Section" padding>
        This is a section
      </SectionPanel>
    </StoryBlock>
  </>
);
