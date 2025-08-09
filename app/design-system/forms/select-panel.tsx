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
import { CheckIcon } from '@heroicons/react/16/solid';
import { cx } from 'class-variance-authority';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';
import { menuItem, menuItems } from '../styles/menu.styles.ts';
import { Label, Text } from '../typography.tsx';
import { Input } from './input.tsx';

export type SelectPanelOption = { value: string; label: string; color?: string };

export type Props = {
  name?: string;
  label: string;
  options: Array<SelectPanelOption>;
  defaultValue: string | Array<string>;
  multiple?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  form?: string;
  loading?: boolean;
  onSearch?: (query: string) => void | Promise<void>;
  onChange?: (values: string | Array<string>) => void;
  className?: string;
};

export function SelectPanel({
  name,
  label,
  options,
  defaultValue,
  multiple = true,
  children,
  footer,
  form,
  loading: _loading, // todo(proposal): manage loading state
  onSearch,
  onChange,
  className,
}: Props) {
  const { t } = useTranslation();

  const [selected, setSelected] = useState<string | Array<string>>(defaultValue);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    if (onSearch) {
      await onSearch(searchQuery);
    }
  }, 300);

  const filteredOptions = useMemo(() => {
    if (onSearch) return options;
    return options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
  }, [options, query, onSearch]);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    if (onSearch) debouncedSearch(value);
  };

  const handleSelectionChange = (selectedOptions: string | Array<string>) => {
    setSelected(selectedOptions);
    if (onChange) onChange(selectedOptions);
  };

  // Get selected values as array for hidden inputs
  const selectedValues = Array.isArray(selected) ? selected : selected ? [selected] : [];

  return (
    <Field className={cx('relative', className)}>
      <Label className="sr-only">{label}</Label>

      {/* Hidden inputs for form submission */}
      {name && selectedValues.map((value) => <input key={value} type="hidden" name={name} value={value} form={form} />)}

      <Popover>
        {({ open }) => {
          if (open !== isOpen) {
            setIsOpen(open);
          }
          return (
            <>
              <PopoverButton className="w-full cursor-pointer">{children}</PopoverButton>

              <PopoverPanel className={cx('mt-1', menuItems('w-(--button-width)'))} anchor="bottom">
                <Combobox value={selected} onChange={handleSelectionChange} multiple={multiple} as="div">
                  <Text weight="medium" className="px-2 ml-1">
                    {label}
                  </Text>

                  <ComboboxInput as={Fragment} onChange={handleQueryChange} displayValue={() => query}>
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
                    {filteredOptions.map((option) => {
                      // Manual selected state calculation for single-select mode
                      const isSelected = multiple
                        ? Array.isArray(selected) && selected.includes(option.value)
                        : selected === option.value;

                      return (
                        <ComboboxOption key={option.value} value={option.value} className={menuItem()}>
                          {({ selected: headlessSelected }) => (
                            <div className="flex items-center justify-between gap-2 truncate">
                              {multiple ? (
                                <input
                                  id={`checkbox-${option.value}`}
                                  type="checkbox"
                                  checked={headlessSelected}
                                  onChange={(e) => e.preventDefault()}
                                  className="h-4 w-4 rounded-sm border-gray-300 text-indigo-600 focus:ring-0 outline-none"
                                />
                              ) : isSelected ? (
                                <CheckIcon className="h-4 w-4 shrink-0" />
                              ) : null}

                              {option.color ? (
                                <div
                                  className="h-4 w-4 shrink-0 rounded-full"
                                  style={{ backgroundColor: option.color }}
                                />
                              ) : null}

                              <Text truncate>{option.label}</Text>
                            </div>
                          )}
                        </ComboboxOption>
                      );
                    })}

                    {filteredOptions.length === 0 ? (
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
