import { Combobox, ComboboxOptions } from '@headlessui/react';
import { useCallback, useMemo, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { CommandPaletteEmptyState } from './command-palette-empty-state.tsx';
import { CommandPaletteInput } from './command-palette-input.tsx';
import { CommandPaletteItem } from './command-palette-item.tsx';
import { CommandPaletteSection } from './command-palette-section.tsx';

export type CommandPaletteItemData = {
  section: string;
  id: string;
  title: string;
  description?: string | null;
  icon?: React.ComponentType<any>;
  picture?: string;
};

type CommandPaletteProps = {
  title: string;
  subtitle: string;
  items: CommandPaletteItemData[];
  loading: boolean;
  withOpenKey?: boolean;
  onClose: VoidFunction;
  onSearch: (query: string) => Promise<void>;
  onClick: (item: CommandPaletteItemData, query: string) => void;
  className?: string;
};

// todo(autocomplete): add tests
// todo(autocomplete): add translations
export function CommandPalette({
  title,
  subtitle,
  items,
  loading,
  withOpenKey,
  onSearch,
  onClose,
  onClick,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [typing, setTyping] = useState(false);
  const isLoading = loading || typing;

  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    await onSearch(searchQuery);
    setTyping(false);
  }, 300);

  const itemsBySection = useMemo(() => {
    const sections: Record<string, CommandPaletteItemData[]> = {};
    for (const item of items) {
      if (sections[item.section]) {
        sections[item.section].push(item);
      } else {
        sections[item.section] = [item];
      }
    }
    return sections;
  }, [items]);

  const handleSelect = useCallback(
    (item: CommandPaletteItemData) => {
      if (item) {
        onClick(item, query);
        onClose();
      }
    },
    [onClick, query, onClose],
  );

  const handleQueryChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setTyping(true);
      setQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  return (
    <Combobox onChange={handleSelect}>
      <CommandPaletteInput value={query} onChange={handleQueryChange} loading={isLoading} withOpenKey={withOpenKey} />

      <ComboboxOptions
        className="max-h-[28rem] scroll-py-2 divide-y divide-gray-200 border-t border-t-gray-200 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300"
        autoFocus
        static
      >
        {items.length === 0 ? (
          <CommandPaletteEmptyState title={title} subtitle={subtitle} hasQuery={Boolean(query)} loading={isLoading} />
        ) : (
          Object.keys(itemsBySection).map((section) => {
            const itemsSection = itemsBySection[section];
            return (
              <CommandPaletteSection key={section} title={section} count={itemsSection.length}>
                {itemsSection.map((item) => (
                  <CommandPaletteItem key={item.id} item={item} />
                ))}
              </CommandPaletteSection>
            );
          })
        )}
      </ComboboxOptions>
    </Combobox>
  );
}
