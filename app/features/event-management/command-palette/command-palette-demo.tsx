import { useEffect, useState } from 'react';
import { Button } from '~/design-system/buttons.tsx';
import { Kbd } from '~/design-system/kbd.tsx';
import { Container } from '~/design-system/layouts/container.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H1 } from '~/design-system/typography.tsx';
import { stubProposals, stubSpeakers } from './command-palette-stub-data.ts';
import { generateSuggestions } from './command-palette-utils.ts';
import type {
  CommandPaletteAction,
  CommandPaletteItem,
  CommandPaletteProposal,
  CommandPaletteSearchConfig,
  CommandPaletteSpeaker,
} from './components/command-palette.tsx';
import { CommandPalette } from './components/command-palette.tsx';

export default function CommandPaletteDemo() {
  const [isOpen, setIsOpen] = useState(false);

  const searchConfig: CommandPaletteSearchConfig = {
    enableProposalCreation: true,
    enableSpeakerCreation: true,
    maxResults: 3,
  };

  const handleClick = (item: CommandPaletteItem, query: string) => {
    switch (item.type) {
      case 'proposal': {
        const proposal = item.data as CommandPaletteProposal;
        alert(`Selected proposal: ${proposal.title}`);
        break;
      }
      case 'speaker': {
        const speaker = item.data as CommandPaletteSpeaker;
        alert(`Selected speaker: ${speaker.name}`);
        break;
      }
      case 'action': {
        const action = item.data as CommandPaletteAction;
        if (action.type === 'create-proposal') {
          alert(`Create proposal: "${query}"`);
        } else if (action.type === 'create-speaker') {
          alert(`Create speaker: "${query}"`);
        }
        break;
      }
    }
  };

  const handleSearch = async (query: string, config: CommandPaletteSearchConfig) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Regular search for suggestions
    return generateSuggestions({
      query,
      proposals: stubProposals,
      speakers: stubSpeakers,
      config,
    });
  };

  const openCommandPalette = () => setIsOpen(true);
  const closeCommandPalette = () => setIsOpen(false);

  // Handle Cmd+K to open palette
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <Page>
      <Container>
        <div className="py-8 space-y-8">
          <div className="text-center">
            <H1 size="2xl" className="mb-4">
              Command Palette Demo
            </H1>
          </div>

          <div className="max-w-2xl mx-auto space-y-8">
            {/* Quick Access */}
            <div className="text-center space-y-4">
              <div className="flex gap-4 justify-center">
                <Button variant="primary" onClick={openCommandPalette}>
                  Open Command Palette
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                <p>
                  Try pressing <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isOpen}
        onClose={closeCommandPalette}
        onSearch={handleSearch}
        onClick={handleClick}
        searchConfig={searchConfig}
      />
    </Page>
  );
}
