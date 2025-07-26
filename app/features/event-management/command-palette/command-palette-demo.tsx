import { useEffect, useState } from 'react';
import { Button } from '~/design-system/buttons.tsx';
import { Kbd } from '~/design-system/kbd.tsx';
import { Container } from '~/design-system/layouts/container.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H1 } from '~/design-system/typography.tsx';
import { stubProposals, stubSpeakers } from './command-palette-stub-data.ts';
import { generateSuggestions } from './command-palette-utils.ts';
import type { CommandPaletteItemData } from './components/command-palette.tsx';
import { CommandPalette } from './components/command-palette.tsx';

export default function CommandPaletteDemo() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (item: CommandPaletteItemData, query: string) => {
    switch (item.type) {
      case 'proposal': {
        alert(`Selected proposal: ${item.title}`);
        break;
      }
      case 'speaker': {
        alert(`Selected speaker: ${item.title}`);
        break;
      }
      case 'action': {
        if (item.id === 'create-proposal') {
          alert(`Create proposal: "${query}"`);
        } else if (item.id === 'create-speaker') {
          alert(`Create speaker: "${query}"`);
        }
        break;
      }
    }
  };

  const handleSearch = async (query: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return generateSuggestions({ query, proposals: stubProposals, speakers: stubSpeakers });
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

      <CommandPalette
        title="Command Palette"
        subtitle="Search for proposals, speakers, or create new content"
        isOpen={isOpen}
        onClose={closeCommandPalette}
        onSearch={handleSearch}
        onClick={handleClick}
      />
    </Page>
  );
}
