import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';
import { href, useFetcher, useNavigate } from 'react-router';
import type { loader as AutocompleteLoader } from '../autocomplete.tsx';
import { CommandPalette, type CommandPaletteItemData } from './command-palette/command-palette.tsx';

type Props = { team: string; event: string };

export function MainCommandPalette({ team, event }: Props) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const fetcher = useFetcher<typeof AutocompleteLoader>();
  const loading = ['loading', 'submitting'].includes(fetcher.state);

  // todo(autocomplete): add more results for section
  const items = useMemo<CommandPaletteItemData[]>(() => {
    if (!fetcher.data) return [];

    return fetcher.data.proposals.map((proposal) => ({
      section: 'proposals',
      id: proposal.id,
      title: proposal.title,
      description: proposal.speakers.join(', '),
      icon: DocumentTextIcon,
    }));
  }, [fetcher.data]);

  const onSearch = (query: string) => {
    return fetcher.submit(
      { query },
      { method: 'GET', action: href('/team/:team/:event/autocomplete', { team, event }) },
    );
  };

  const handleClick = (item: CommandPaletteItemData, query: string) => {
    switch (item.section) {
      case 'proposals': {
        navigate(href('/team/:team/:event/reviews/:proposal', { team, event, proposal: item.id }));
        break;
      }
      case 'speakers': {
        alert(`Selected speaker: ${item.title}`);
        break;
      }
      case 'commands': {
        if (item.id === 'create-proposal') {
          alert(`Create proposal: "${query}"`);
        } else if (item.id === 'create-speaker') {
          alert(`Create speaker: "${query}"`);
        }
        break;
      }
    }
  };

  // todo(autocomplete): can be in the component ?
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
    <CommandPalette
      title="Command Palette"
      subtitle="Search for proposals, speakers, or create new content"
      items={items}
      loading={loading}
      open={isOpen}
      onClose={() => setIsOpen(false)}
      onSearch={onSearch}
      onClick={handleClick}
    />
  );
}
