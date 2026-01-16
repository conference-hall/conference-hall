import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Field,
  Label,
} from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/16/solid';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../badges.tsx';

type Option = { value: string; label: string };

type Props = {
  name: string;
  label: string;
  placeholder: string;
  options: Array<Option>;
  defaultValues: string[];
  className?: string;
};

export default function MultiSelect({ name, label, placeholder, options, defaultValues, className }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string[]>(defaultValues);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedOptions = selected.map((current) => options.find(({ value }) => value === current));
  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleRemove = (value: string) => {
    setSelected((prev) => prev.filter((v) => v !== value));
  };

  const handleSelect = (selectedOptions: string[]) => {
    setSelected(selectedOptions);
  };

  return (
    <Field className={className}>
      <Label className="block text-sm leading-6 font-medium text-gray-900">{label}</Label>

      <Combobox name={name} value={selected} onChange={handleSelect} multiple immediate>
        <div className="relative mt-2">
          <div className="relative min-h-0 w-full cursor-default rounded-md border border-gray-300 bg-white py-1 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
            <ul className="flex w-full flex-wrap items-center gap-1 py-[1px] pr-7 pl-1.5">
              {selectedOptions.map((option) => (
                <li key={option?.value} className="flex items-center" aria-label={option?.label}>
                  <Badge onClose={() => handleRemove(option?.value || '')} closeLabel={option?.label}>
                    {option?.label}
                  </Badge>
                </li>
              ))}
              <li className="flex-1">
                <ComboboxInput
                  className="w-full min-w-24 border-0 px-1 py-0 text-sm leading-6 text-gray-900 outline-none placeholder:text-gray-400 focus:ring-0"
                  placeholder={selected.length === 0 ? placeholder : t('common.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </li>
            </ul>

            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </ComboboxButton>
          </div>

          <ComboboxOptions className="absolute z-40 mt-1 max-h-64 w-full overflow-auto rounded-xl bg-white py-2 text-sm shadow-lg ring-1 ring-black/5 focus:outline-hidden">
            {filteredOptions.map((option) => (
              <ComboboxOption
                key={option.value}
                value={option.value}
                className="relative mx-2 cursor-default rounded-lg px-2 py-1.5 text-gray-700 select-none data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
              >
                {({ selected }) => (
                  <>
                    <span className={cx(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                      {option.label}
                    </span>

                    {selected ? (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </ComboboxOption>
            ))}

            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">{t('common.no-results')}</div>
            )}
          </ComboboxOptions>
        </div>
      </Combobox>
    </Field>
  );
}
