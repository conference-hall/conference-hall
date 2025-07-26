import { DocumentTextIcon, UserIcon } from '@heroicons/react/24/outline';
import type { CommandPaletteStub } from './command-palette-stub-data.ts';
import type { CommandPaletteItemData, CommandPaletteSearchConfig } from './components/command-palette.tsx';

export type CommandPaletteSearchParams = {
  query: string;
  proposals: CommandPaletteStub[];
  speakers: CommandPaletteStub[];
  config: CommandPaletteSearchConfig;
};

export function generateSuggestions({
  query,
  proposals,
  speakers,
  config,
}: CommandPaletteSearchParams): CommandPaletteItemData[] {
  const items: CommandPaletteItemData[] = [];
  const searchQuery = query.toLowerCase().trim();

  // Only show suggestions if there's a search query
  if (!searchQuery) {
    return items;
  }

  const { enableProposalCreation = true, enableSpeakerCreation = true, maxResults = 5 } = config;

  // Filter proposals
  const filteredProposals = proposals
    .filter(
      (proposal) =>
        proposal.title.toLowerCase().includes(searchQuery) ||
        proposal.description?.toLowerCase()?.includes(searchQuery),
    )
    .slice(0, maxResults);

  filteredProposals.forEach((proposal) => {
    items.push({ ...proposal, type: 'proposal', icon: DocumentTextIcon });
  });

  // Filter speakers
  const filteredSpeakers = speakers
    .filter(
      (speaker) =>
        speaker.title?.toLowerCase().includes(searchQuery) || speaker.description?.toLowerCase().includes(searchQuery),
    )
    .slice(0, maxResults);

  filteredSpeakers.forEach((speaker) => {
    items.push({ ...speaker, type: 'speaker' });
  });

  // Add creation actions if query is not empty
  if (searchQuery && enableProposalCreation) {
    items.push({
      type: 'action',
      id: 'create-proposal',
      title: `Create proposal "${query}"`,
      icon: DocumentTextIcon,
    });
  }

  if (searchQuery && enableSpeakerCreation) {
    items.push({
      type: 'action',
      id: 'create-speaker',
      title: `Create speaker "${query}"`,
      icon: UserIcon,
    });
  }

  return items;
}
