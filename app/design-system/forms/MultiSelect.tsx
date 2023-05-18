import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import c from 'classnames';
import { useState } from 'react';

import { Badge } from '../Badges';
import { SelectTransition } from '../Transitions';
import { Text } from '../Typography';

type Option = { value: string; label: string };

type Props = {
  name: string;
  label: string;
  placeholder: string;
  options: Array<Option>;
  defaultValues: string[];
  className?: string;
};

type SelectedOptionsProps = {
  selectedValues: string[];
  options: Array<Option>;
};

function SelectedOptions({ selectedValues, options }: SelectedOptionsProps) {
  const selected = selectedValues.map((current) => options.find(({ value }) => value === current));
  return (
    <>
      {selected.map((option) => (
        <Badge key={option?.value}>{option?.label}</Badge>
      ))}
    </>
  );
}

export default function MultiSelect({ name, label, placeholder, options, defaultValues, className }: Props) {
  const [selected, setSelected] = useState<string[]>(defaultValues);
  return (
    <Listbox name={name} value={selected} onChange={setSelected} multiple>
      {({ open }) => (
        <div className={className}>
          <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">{label}</Listbox.Label>
          <div className="relative mt-2">
            <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
              {selected.length > 0 ? (
                <div className="space-x-2">
                  <SelectedOptions selectedValues={selected} options={options} />
                </div>
              ) : (
                <Text variant="secondary" as="div" truncate>
                  {placeholder}
                </Text>
              )}
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <SelectTransition show={open}>
              <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {options.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    value={option.value}
                    className={({ active }) =>
                      c(
                        active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-9'
                      )
                    }
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={c(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                          {option.label}
                        </span>

                        {selected ? (
                          <span
                            className={c(
                              active ? 'text-white' : 'text-indigo-600',
                              'absolute inset-y-0 right-0 flex items-center pr-4'
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </SelectTransition>
          </div>
        </div>
      )}
    </Listbox>
  );
}
