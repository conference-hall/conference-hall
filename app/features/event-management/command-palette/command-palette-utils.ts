import { DocumentTextIcon, UserIcon } from '@heroicons/react/24/outline';
import type { CommandPaletteStub } from './command-palette-stub-data.ts';
import type { CommandPaletteItemData } from './components/command-palette/command-palette.tsx';

export type CommandPaletteSearchParams = {
  query: string;
  proposals: CommandPaletteStub[];
  speakers: CommandPaletteStub[];
};

export function generateSuggestions({
  query,
  proposals,
  speakers,
}: CommandPaletteSearchParams): CommandPaletteItemData[] {
  const items: CommandPaletteItemData[] = [];
  const searchQuery = query.toLowerCase().trim();

  // Only show suggestions if there's a search query
  if (!searchQuery) {
    return items;
  }

  const maxResults = 5;

  // Filter proposals
  const filteredProposals = proposals
    .filter(
      (proposal) =>
        proposal.title.toLowerCase().includes(searchQuery) ||
        proposal.description?.toLowerCase()?.includes(searchQuery),
    )
    .slice(0, maxResults);

  filteredProposals.forEach((proposal) => {
    items.push({ ...proposal, section: 'proposals', icon: DocumentTextIcon });
  });

  // Filter speakers
  const filteredSpeakers = speakers
    .filter(
      (speaker) =>
        speaker.title?.toLowerCase().includes(searchQuery) || speaker.description?.toLowerCase().includes(searchQuery),
    )
    .slice(0, maxResults);

  filteredSpeakers.forEach((speaker) => {
    items.push({ ...speaker, section: 'speakers' });
  });

  // Add creation commands if query is not empty
  if (searchQuery) {
    items.push({
      section: 'commands',
      id: 'create-proposal',
      title: `Create proposal "${query}"`,
      icon: DocumentTextIcon,
    });
  }

  if (searchQuery) {
    items.push({
      section: 'commands',
      id: 'create-speaker',
      title: `Create speaker "${query}"`,
      icon: UserIcon,
    });
  }

  return items;
}
