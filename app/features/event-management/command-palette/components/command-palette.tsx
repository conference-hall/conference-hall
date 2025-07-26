import { Combobox, ComboboxOption, ComboboxOptions, Dialog, DialogPanel } from '@headlessui/react';
import { ChevronRightIcon, CommandLineIcon, DocumentTextIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { cva } from 'class-variance-authority';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Avatar } from '~/design-system/avatar.tsx';
import { Kbd } from '~/design-system/kbd.tsx';
import { Text } from '~/design-system/typography.tsx';
import { CommandPaletteInput } from './command-palette-input.tsx';
import { CommandPaletteSection } from './command-palette-section.tsx';

export type CommandPaletteProposal = {
  id: string;
  title: string;
  speakers: string[];
  description?: string;
};

export type CommandPaletteSpeaker = {
  id: string;
  name: string;
  email: string;
  company?: string;
  avatar?: string;
};

export type CommandPaletteAction = {
  id: string;
  type: 'create-proposal' | 'create-speaker';
  label: string;
  icon: React.ComponentType<any>;
  description?: string;
};

export type CommandPaletteItem = {
  type: 'proposal' | 'speaker' | 'action';
  data: CommandPaletteProposal | CommandPaletteSpeaker | CommandPaletteAction;
  priority?: number; // For custom ordering
};

export type CommandPaletteSearchConfig = {
  enableProposalCreation?: boolean;
  enableSpeakerCreation?: boolean;
  maxResults?: number;
  placeholder?: string;
};

type CommandPaletteProps = {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string, config: CommandPaletteSearchConfig) => Promise<CommandPaletteItem[]>;
  onClick?: (item: CommandPaletteItem, query: string) => void;
  searchConfig?: CommandPaletteSearchConfig;
  className?: string;
};

// Component variants for better theming
const dialogVariants = cva(
  'mx-auto transform overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transition-all duration-200 ease-out',
  {
    variants: { size: { sm: 'max-w-lg', md: 'max-w-2xl', lg: 'max-w-4xl' } },
    defaultVariants: { size: 'md' },
  },
);

const optionVariants = cva(
  'group flex cursor-default select-none items-center rounded-lg px-3 py-2.5 transition-all duration-150 ease-out hover:bg-gray-50',
  {
    variants: {
      variant: {
        default: 'data-focus:bg-gray-100',
        primary: 'data-focus:bg-indigo-600 data-focus:text-white',
        success: 'data-focus:bg-green-600 data-focus:text-white',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

const ProposalItem = ({ item }: { item: CommandPaletteItem }) => {
  const proposal = item.data as CommandPaletteProposal;

  return (
    <ComboboxOption key={proposal.id} value={item} className={optionVariants()}>
      <div className="flex-none">
        <div className="p-1.5 rounded-lg bg-gray-100 group-data-focus:bg-white group-data-focus:shadow-sm transition-all">
          <DocumentTextIcon className="h-4 w-4 text-gray-500 group-data-focus:text-indigo-600" />
        </div>
      </div>
      <div className="ml-3 flex-auto min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate group-data-focus:text-gray-900">{proposal.title}</p>
        <div className="flex items-center space-x-2 mt-1">
          <p className="text-xs text-gray-500 truncate">{proposal.speakers.join(', ')}</p>
        </div>
      </div>
      <ChevronRightIcon className="ml-3 h-4 w-4 text-gray-400 group-data-focus:text-gray-600 transition-transform group-data-focus:translate-x-1" />
    </ComboboxOption>
  );
};

const SpeakerItem = ({ item }: { item: CommandPaletteItem }) => {
  const speaker = item.data as CommandPaletteSpeaker;

  return (
    <ComboboxOption key={speaker.id} value={item} className={optionVariants()}>
      <div className="flex-none">
        <Avatar
          picture={speaker.avatar}
          name={speaker.name}
          size="s"
          className="group-data-focus:ring-indigo-500 transition-all"
        />
      </div>
      <div className="ml-3 flex-auto min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{speaker.name}</p>
        <p className="text-xs text-gray-500 truncate">
          {speaker.email}
          {speaker.company && (
            <>
              <span className="mx-1 text-gray-300">•</span>
              <span className="font-medium">{speaker.company}</span>
            </>
          )}
        </p>
      </div>
      <ChevronRightIcon className="ml-3 h-4 w-4 text-gray-400 group-data-focus:text-gray-600 transition-transform group-data-focus:translate-x-1" />
    </ComboboxOption>
  );
};

const ActionItem = ({ item }: { item: CommandPaletteItem }) => {
  const action = item.data as CommandPaletteAction;
  const IconComponent = action.icon;

  return (
    <ComboboxOption key={action.id} value={item} className={optionVariants({ variant: 'primary' })}>
      <div className="flex-none">
        <div className="p-1.5 rounded-lg bg-indigo-100 group-data-focus:bg-white group-data-focus:shadow-sm transition-all">
          <IconComponent className="h-4 w-4 text-indigo-600 group-data-focus:text-indigo-600" />
        </div>
      </div>
      <div className="ml-3 flex-auto min-w-0">
        <p className="text-sm font-semibold text-gray-900 group-data-focus:text-white">{action.label}</p>
        {action.description && (
          <p className="text-xs text-gray-500 group-data-focus:text-indigo-100 truncate">{action.description}</p>
        )}
      </div>
    </ComboboxOption>
  );
};

const EmptyState = ({ hasQuery, isLoading }: { hasQuery: boolean; isLoading?: boolean }) => {
  if (isLoading) {
    return null;
  }

  if (hasQuery) {
    return (
      <div className="px-8 py-16 text-center">
        <div className="p-3 rounded-full bg-gray-100 w-fit mx-auto mb-6">
          <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-900 mb-2">No results found</p>
        <p className="text-xs text-gray-500 mb-4">Try adjusting your search or create something new</p>
      </div>
    );
  }

  return (
    <div className="px-8 py-16 text-center">
      <div className="p-3 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 w-fit mx-auto mb-6">
        <CommandLineIcon className="h-6 w-6 text-indigo-600" />
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-2">Command Palette</p>
      <Text size="xs" variant="secondary" className="mb-6">
        Search for proposals, speakers, or create new content
      </Text>
      <div className="flex justify-center space-x-6">
        <div className="flex items-center space-x-1">
          <Kbd>↑↓</Kbd>
          <Text as="span" size="xs" variant="secondary">
            navigate
          </Text>
        </div>
        <div className="flex items-center space-x-1">
          <Kbd>↵</Kbd>
          <Text as="span" size="xs" variant="secondary">
            select
          </Text>
        </div>
        <div className="flex items-center space-x-1">
          <Kbd>esc</Kbd>
          <Text as="span" size="xs" variant="secondary">
            close
          </Text>
        </div>
      </div>
    </div>
  );
};

export function CommandPalette({
  isOpen,
  onClose,
  onSearch,
  onClick,
  searchConfig = {},
  className,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CommandPaletteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search with configurable delay
  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    if (!onSearch) {
      setIsLoading(false);
      return;
    }

    try {
      const results = await onSearch(searchQuery, searchConfig);
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  // Sort and group items with better organization
  const groupedItems = useMemo(() => {
    const sorted = [...suggestions].sort((a, b) => (b.priority || 0) - (a.priority || 0));

    const groups = {
      proposals: [] as CommandPaletteItem[],
      speakers: [] as CommandPaletteItem[],
      actions: [] as CommandPaletteItem[],
    };

    sorted.forEach((item) => {
      groups[`${item.type}s` as keyof typeof groups]?.push(item);
    });

    return groups;
  }, [suggestions]);

  const handleSelect = useCallback(
    (item: CommandPaletteItem) => {
      onClick?.(item, query);
      onClose();
    },
    [onClick, query, onClose],
  );

  const handleClose = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    onClose();
  }, [onClose]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setIsLoading(true);
      setQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  // Global keyboard shortcut (Cmd/Ctrl+K only - HeadlessUI handles navigation)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (isOpen) {
          handleClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [isOpen]);

  const hasResults = suggestions.length > 0;

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Backdrop with blur effect */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out" />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
        <DialogPanel className={dialogVariants({ className })}>
          <Combobox onChange={handleSelect}>
            <CommandPaletteInput
              query={query}
              onQueryChange={handleInputChange}
              placeholder={searchConfig.placeholder}
              isLoading={isLoading}
            />

            <ComboboxOptions
              static
              className="max-h-[28rem] scroll-py-2 divide-y divide-gray-200 border-t border-t-gray-200 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300"
            >
              {!hasResults ? (
                <EmptyState hasQuery={Boolean(query)} isLoading={isLoading} />
              ) : (
                <>
                  <CommandPaletteSection title="Proposals" count={groupedItems.proposals.length}>
                    {groupedItems.proposals.map((item) => (
                      <ProposalItem key={item.data.id} item={item} />
                    ))}
                  </CommandPaletteSection>

                  <CommandPaletteSection title="Speakers" count={groupedItems.speakers.length}>
                    {groupedItems.speakers.map((item) => (
                      <SpeakerItem key={item.data.id} item={item} />
                    ))}
                  </CommandPaletteSection>

                  <CommandPaletteSection title="Actions" count={groupedItems.actions.length}>
                    {groupedItems.actions.map((item) => (
                      <ActionItem key={item.data.id} item={item} />
                    ))}
                  </CommandPaletteSection>
                </>
              )}
            </ComboboxOptions>
          </Combobox>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
