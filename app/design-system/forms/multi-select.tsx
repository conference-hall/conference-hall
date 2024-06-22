import { Field, Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { useState } from 'react';

import { Badge } from '../Badges.tsx';
import { SelectTransition } from '../Transitions.tsx';
import { Text } from '../Typography.tsx';

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
    <Field className={className}>
      <Label className="block text-sm font-medium leading-6 text-gray-900">{label}</Label>
      <Listbox name={name} value={selected} onChange={setSelected} multiple>
        {({ open }) => (
          <div className="relative mt-2">
            <ListboxButton className="relative w-full cursor-default rounded-md border border-gray-300 bg-white h-9 pl-2 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm">
              {selected.length > 0 ? (
                <div className="space-x-1">
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
            </ListboxButton>

            <SelectTransition show={open}>
              <ListboxOptions
                modal={false}
                anchor={{ to: 'bottom start', gap: '4px' }}
                className="z-20 w-[var(--button-width)] rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                {options.map((option) => (
                  <ListboxOption
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
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </SelectTransition>
          </div>
        )}
      </Listbox>
    </Field>
  );
}
