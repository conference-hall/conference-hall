import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Field,
  Popover,
  PopoverButton,
  PopoverPanel,
} from '@headlessui/react';
import { cx } from 'class-variance-authority';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '~/design-system/forms/input.tsx';
import { menuItem, menuItems } from '~/design-system/styles/menu.styles.ts';
import { Label, Text } from '~/design-system/typography.tsx';

export type SelectPanelNewOption = { id: string; name: string };

type SelectPanelNewProps<T extends SelectPanelNewOption> = {
  name?: string;
  label: string;
  form?: string;
  defaultValue?: T[];
  loading?: boolean;
  options: T[];
  children: React.ReactNode;
  footer?: React.ReactNode;
  onChange: (selectedItems: T[]) => void;
  onSearch?: (query: string) => Promise<void>;
};

export function SelectPanelNew<T extends SelectPanelNewOption>({
  name = 'items',
  label,
  form,
  defaultValue = [],
  loading = false,
  options,
  children,
  footer,
  onChange,
  onSearch,
}: SelectPanelNewProps<T>) {
  const { t } = useTranslation();

  const [selectedItems, setSelectedItems] = useState<T[]>(defaultValue);
  const [query, setQuery] = useState('');
  const [typing, setTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLoading = loading || typing;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    if (onSearch) {
      await onSearch(searchQuery);
    }
    setTyping(false);
  }, 300);

  const availableOptions = useMemo(() => {
    const filteredSelectedItems = selectedItems.filter((option) => !options.find((item) => item.id === option.id));
    return [...filteredSelectedItems, ...options];
  }, [options, selectedItems]);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setTyping(true);
    setQuery(value);
    if (onSearch) {
      debouncedSearch(value);
    }
  };

  const handleSelectionChange = (items: T[]) => {
    setSelectedItems(items);
    onChange(items);
  };

  return (
    <Field className="relative">
      <Label className="sr-only">{label}</Label>

      {/* Hidden inputs for form submission */}
      {selectedItems.map((item) => (
        <input key={item.id} type="hidden" name={name} value={item.id} form={form} />
      ))}

      <Popover>
        {({ open }) => {
          if (open !== isOpen) {
            setIsOpen(open);
          }
          return (
            <>
              <PopoverButton className="w-full cursor-pointer">{children}</PopoverButton>

              <PopoverPanel className={cx('mt-1', menuItems('w-(--button-width)'))} anchor="bottom">
                <Combobox value={selectedItems} onChange={handleSelectionChange} multiple by="id">
                  <Text weight="medium" className="px-2 ml-1">
                    {label}
                  </Text>

                  <ComboboxInput as={Fragment} onChange={handleQueryChange}>
                    <Input
                      ref={inputRef}
                      type="text"
                      size="s"
                      className="w-full p-2 border-b border-b-gray-200 text-sm"
                      placeholder={t('common.search.placeholder')}
                      value={query}
                    />
                  </ComboboxInput>

                  <ComboboxOptions className="max-h-48 pt-2 overflow-y-auto" static>
                    {availableOptions.map((item) => (
                      <ComboboxOption key={item.id} value={item} className={menuItem()}>
                        {({ selected }) => (
                          <div className="flex items-center justify-between gap-2 truncate">
                            <input
                              id={`checkbox-${item.id}`}
                              type="checkbox"
                              checked={selected}
                              onChange={(e) => e.preventDefault()}
                              className="h-4 w-4 rounded-sm border-gray-300 text-indigo-600 focus:ring-0 outline-none"
                            />
                            <Text truncate>{item.name}</Text>
                          </div>
                        )}
                      </ComboboxOption>
                    ))}

                    {availableOptions.length === 0 && !isLoading ? (
                      <Text size="xs" variant="secondary" className="px-4 py-2">
                        {t('common.no-results')}
                      </Text>
                    ) : null}
                  </ComboboxOptions>

                  {footer ? <div className="pt-2 mt-2 border-t border-t-gray-200 flex">{footer}</div> : null}
                </Combobox>
              </PopoverPanel>
            </>
          );
        }}
      </Popover>
    </Field>
  );
}
