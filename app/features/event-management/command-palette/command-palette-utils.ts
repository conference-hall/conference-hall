import { DocumentTextIcon, UserIcon } from '@heroicons/react/24/outline';
import type {
  CommandPaletteItem,
  CommandPaletteProposal,
  CommandPaletteSearchConfig,
  CommandPaletteSpeaker,
} from './command-palette.tsx';

export type CommandPaletteSearchParams = {
  query: string;
  proposals: CommandPaletteProposal[];
  speakers: CommandPaletteSpeaker[];
  config: CommandPaletteSearchConfig;
};

export function generateSuggestions({
  query,
  proposals,
  speakers,
  config,
}: CommandPaletteSearchParams): CommandPaletteItem[] {
  const items: CommandPaletteItem[] = [];
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
        proposal.speakers.some((speaker) => speaker.toLowerCase().includes(searchQuery)),
    )
    .slice(0, maxResults);

  filteredProposals.forEach((proposal) => {
    items.push({ type: 'proposal', data: proposal });
  });

  // Filter speakers
  const filteredSpeakers = speakers
    .filter(
      (speaker) =>
        speaker.name.toLowerCase().includes(searchQuery) ||
        speaker.email.toLowerCase().includes(searchQuery) ||
        speaker.company?.toLowerCase().includes(searchQuery),
    )
    .slice(0, maxResults);

  filteredSpeakers.forEach((speaker) => {
    items.push({ type: 'speaker', data: speaker });
  });

  // Add creation actions if query is not empty
  if (searchQuery && enableProposalCreation) {
    items.push({
      type: 'action',
      data: {
        id: 'create-proposal',
        type: 'create-proposal',
        label: `Create proposal "${query}"`,
        icon: DocumentTextIcon,
      },
    });
  }

  if (searchQuery && enableSpeakerCreation) {
    items.push({
      type: 'action',
      data: {
        id: 'create-speaker',
        type: 'create-speaker',
        label: `Create speaker "${query}"`,
        icon: UserIcon,
      },
    });
  }

  return items;
}
