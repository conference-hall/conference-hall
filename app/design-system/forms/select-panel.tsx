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
import { LoadingIcon } from '../icons/loading-icon.tsx';
import { menuItem, menuItems } from '../styles/menu.styles.ts';
import { Label, Text } from '../typography.tsx';
import { Input } from './input.tsx';

type SelectPanelOption = { value: string; label: string; color?: string };

type SelectPanelContentProps = {
  options: Array<SelectPanelOption>;
  selected: string | Array<string>;
  multiple: boolean;
  loading?: boolean;
  onSelectionChange: (values: string | Array<string>) => void;
  onSearch?: (query: string) => void | Promise<void>;
  footer?: React.ReactNode;
};

function SelectPanelContent({
  options,
  selected,
  multiple,
  loading,
  onSelectionChange,
  onSearch,
  footer,
}: SelectPanelContentProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [typing, setTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLoading = loading || typing;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    await onSearch?.(searchQuery);
    setTyping(false);
  }, 300);

  const displayedOptions = useMemo(() => {
    if (onSearch) return options;
    return options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
  }, [options, query, onSearch]);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    if (onSearch) {
      setTyping(true);
      debouncedSearch(value);
    }
  };

  const hasNoResults = displayedOptions.length === 0 && query && !isLoading;

  return (
    <Combobox value={selected} onChange={onSelectionChange} multiple={multiple} as="div">
      <ComboboxInput as={Fragment} onChange={handleQueryChange} displayValue={() => query}>
        <Input
          ref={inputRef}
          type="text"
          size="s"
          className="w-full px-2 text-sm"
          placeholder={onSearch ? t('common.search.placeholder') : t('common.filter.placeholder')}
          value={query}
        >
          {isLoading ? (
            <div className="self-center mx-2">
              <LoadingIcon className="h-4 w-4 shrink-0" aria-hidden />
            </div>
          ) : null}
        </Input>
      </ComboboxInput>

      {displayedOptions.length > 0 ? (
        <ComboboxOptions className="max-h-48 py-2 overflow-y-auto" static>
          {displayedOptions.map((option) => {
            const isSelected = multiple
              ? Array.isArray(selected) && selected.includes(option.value)
              : selected === option.value;

            return (
              <ComboboxOption key={option.value} value={option.value} className={menuItem()}>
                <div className="flex items-center justify-between gap-2 truncate">
                  {multiple ? (
                    <input
                      id={`checkbox-${option.value}`}
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => e.preventDefault()}
                      aria-hidden="true"
                      tabIndex={-1}
                      className="h-4 w-4 rounded-sm border-gray-300 text-indigo-600 focus:ring-0 outline-none"
                    />
                  ) : (
                    <input
                      id={`radio-${option.value}`}
                      type="radio"
                      checked={isSelected}
                      onChange={(e) => e.preventDefault()}
                      aria-hidden="true"
                      tabIndex={-1}
                      className="h-4 w-4 rounded-full border-gray-300 text-indigo-600 focus:ring-0 outline-none"
                    />
                  )}

                  {option.color ? (
                    <div className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: option.color }} />
                  ) : null}

                  <Text truncate>{option.label}</Text>
                </div>
              </ComboboxOption>
            );
          })}
        </ComboboxOptions>
      ) : null}

      {displayedOptions.length === 0 && query && !isLoading ? (
        <Text size="s" variant="secondary" className="px-4 py-3">
          {t('common.no-results')}
        </Text>
      ) : null}

      {footer ? (
        <div
          className={cx('flex pt-2', {
            'border-t border-t-gray-200': displayedOptions.length > 0 || hasNoResults,
          })}
        >
          {footer}
        </div>
      ) : null}
    </Combobox>
  );
}

export type SelectPanelProps = {
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
  onSearch,
  onChange,
  loading,
  className,
}: SelectPanelProps) {
  const [selected, setSelected] = useState<string | Array<string>>(defaultValue);

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
        <PopoverButton className="w-full cursor-pointer">{children}</PopoverButton>
        <PopoverPanel className={cx('mt-2', menuItems('w-(--button-width)'))} anchor="bottom">
          <SelectPanelContent
            options={options}
            selected={selected}
            multiple={multiple}
            loading={loading}
            onSelectionChange={handleSelectionChange}
            onSearch={onSearch}
            footer={footer}
          />
        </PopoverPanel>
      </Popover>
    </Field>
  );
}
