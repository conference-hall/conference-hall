import { Combobox, ComboboxOptions, Dialog, DialogPanel } from '@headlessui/react';
import { cva } from 'class-variance-authority';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { CommandPaletteEmptyState } from './command-palette-empty-state.tsx';
import { CommandPaletteInput } from './command-palette-input.tsx';
import { CommandPaletteItem } from './command-palette-item.tsx';
import { CommandPaletteSection } from './command-palette-section.tsx';

export type CommandPaletteItemData = {
  type: 'proposal' | 'speaker' | 'action';
  id: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<any>;
  picture?: string;
};

type CommandPaletteProps = {
  title: string;
  subtitle: string;
  placeholder?: string;
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string) => Promise<CommandPaletteItemData[]>;
  onClick?: (item: CommandPaletteItemData, query: string) => void;
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

export function CommandPalette({
  title,
  subtitle,
  isOpen,
  onClose,
  onSearch,
  onClick,
  placeholder,
  className,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CommandPaletteItemData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search with configurable delay
  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    if (!onSearch) {
      setIsLoading(false);
      return;
    }

    try {
      const results = await onSearch(searchQuery);
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  // Sort and group items with better organization
  const groupedItems = useMemo(() => {
    const groups = {
      proposals: [] as CommandPaletteItemData[],
      speakers: [] as CommandPaletteItemData[],
      actions: [] as CommandPaletteItemData[],
    };

    suggestions.forEach((item) => {
      groups[`${item.type}s` as keyof typeof groups]?.push(item);
    });

    return groups;
  }, [suggestions]);

  const handleSelect = useCallback(
    (item: CommandPaletteItemData) => {
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
              placeholder={placeholder}
              isLoading={isLoading}
            />

            <ComboboxOptions
              static
              className="max-h-[28rem] scroll-py-2 divide-y divide-gray-200 border-t border-t-gray-200 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300"
            >
              {!hasResults ? (
                <CommandPaletteEmptyState
                  title={title}
                  subtitle={subtitle}
                  hasQuery={Boolean(query)}
                  isLoading={isLoading}
                />
              ) : (
                <>
                  <CommandPaletteSection title="Proposals" count={groupedItems.proposals.length}>
                    {groupedItems.proposals.map((item) => (
                      <CommandPaletteItem key={item.id} item={item} />
                    ))}
                  </CommandPaletteSection>

                  <CommandPaletteSection title="Speakers" count={groupedItems.speakers.length}>
                    {groupedItems.speakers.map((item) => (
                      <CommandPaletteItem key={item.id} item={item} />
                    ))}
                  </CommandPaletteSection>

                  <CommandPaletteSection title="Actions" count={groupedItems.actions.length}>
                    {groupedItems.actions.map((item) => (
                      <CommandPaletteItem key={item.id} item={item} />
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
