import { Field, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/16/solid';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '~/design-system/forms/input.tsx';
import { menuItem, menuItems } from '~/design-system/styles/menu.styles.ts';
import { Label, Text } from '~/design-system/typography.tsx';

type Option = { value: string; label: string; color?: string };

export type Props = {
  name: string;
  label: string;
  options: Array<Option>;
  defaultValue: string | Array<string>;
  multiple?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  form?: string;
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
  onChange,
  className,
}: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | Array<string>>(defaultValue);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelect = (selectedOptions: string | Array<string>) => {
    setSelected(selectedOptions);
    if (onChange) onChange(selectedOptions);
  };

  return (
    <Field className={cx('relative', className)}>
      <Label className="sr-only">{label}</Label>

      <Listbox name={name} value={selected} onChange={handleSelect} multiple={multiple} form={form} as="div">
        <ListboxButton className="w-full cursor-pointer">{children}</ListboxButton>

        <ListboxOptions className={cx('mt-1', menuItems('w-(--button-width)'))} anchor="bottom">
          <Text weight="medium" className="px-2 ml-1">
            {label}
          </Text>

          <AutoFocusSearchInput value={searchTerm} onChange={setSearchTerm} />

          <div className="max-h-48 py-2 overflow-y-auto">
            {filteredOptions.map((option) => (
              <ListboxOption key={option.value} value={option.value} className={menuItem()}>
                {({ selected }) => (
                  <div className="flex items-center justify-between gap-2 truncate">
                    {multiple ? (
                      <input
                        id={`checkbox-${option.value}`}
                        type="checkbox"
                        checked={selected}
                        onChange={(e) => e.preventDefault()}
                        className="h-4 w-4 rounded-sm border-gray-300 text-indigo-600 focus:ring-0 outline-none"
                      />
                    ) : selected ? (
                      <CheckIcon className="h-4 w-4 shrink-0" />
                    ) : null}

                    {option.color ? (
                      <div className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: option.color }} />
                    ) : null}

                    <Text truncate>{option.label}</Text>
                  </div>
                )}
              </ListboxOption>
            ))}

            {filteredOptions.length === 0 ? (
              <Text size="s" variant="secondary" className="px-4 py-2">
                {t('common.no-results')}
              </Text>
            ) : null}
          </div>

          {footer ? <div className="pt-2 border-t border-t-gray-200">{footer}</div> : null}
        </ListboxOptions>
      </Listbox>
    </Field>
  );
}

type SearchInputProps = { value: string; onChange: (term: string) => void };

function AutoFocusSearchInput({ value, onChange }: SearchInputProps) {
  const { t } = useTranslation();

  return (
    <Input
      type="text"
      size="s"
      className="w-full p-2 border-b border-b-gray-200 text-sm"
      placeholder={t('common.search.placeholder')}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
