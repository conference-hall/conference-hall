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

type SelectedOptionsProps = { selectedValues: string[]; options: Array<Option>; onRemove: (value: string) => void };

function SelectedOptions({ selectedValues, options, onRemove }: SelectedOptionsProps) {
  const selected = selectedValues.map((current) => options.find(({ value }) => value === current));
  return selected.map((option) => (
    <Badge key={option?.value} onClose={() => onRemove(option?.value || '')} closeLabel={option?.label}>
      {option?.label}
    </Badge>
  ));
}

export default function MultiSelect({ name, label, placeholder, options, defaultValues, className }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string[]>(defaultValues);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleRemove = (value: string) => {
    setSelected((prev) => prev.filter((v) => v !== value));
  };

  const handleSelect = (selectedOptions: string[]) => {
    setSelected(selectedOptions);
  };

  return (
    <Field className={className}>
      <Label className="block text-sm font-medium leading-6 text-gray-900">{label}</Label>

      <Combobox name={name} value={selected} onChange={handleSelect} multiple>
        <div className="relative mt-2">
          <div className="relative w-full cursor-default rounded-md border border-gray-300 bg-white min-h-0 py-1 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
            <div className="flex items-center flex-wrap gap-1 pl-1.5 pr-7 py-[1px]">
              {selected.length > 0 && (
                <SelectedOptions selectedValues={selected} options={options} onRemove={handleRemove} />
              )}

              <ComboboxInput
                className="border-0 flex-1 min-w-24 py-0 px-1 text-sm leading-6 text-gray-900 placeholder:text-gray-400 focus:ring-0 outline-none"
                placeholder={selected.length === 0 ? placeholder : t('common.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </ComboboxButton>
          </div>

          <ComboboxOptions className="z-40 absolute w-full max-h-64 mt-1 rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-hidden overflow-auto">
            {filteredOptions.map((option) => (
              <ComboboxOption
                key={option.value}
                value={option.value}
                className={({ focus }) =>
                  cx('relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900', {
                    'bg-gray-100': focus,
                  })
                }
              >
                {({ selected }) => (
                  <>
                    <span className={cx(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                      {option.label}
                    </span>

                    {selected ? (
                      <span className="text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </ComboboxOption>
            ))}

            {filteredOptions.length === 0 && (
              <div className="py-2 px-3 text-gray-500 text-sm">{t('common.no-results')}</div>
            )}
          </ComboboxOptions>
        </div>
      </Combobox>
    </Field>
  );
}
