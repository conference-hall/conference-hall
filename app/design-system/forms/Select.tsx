import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { useCallback, useState } from 'react';

import { SelectTransition } from '../Transitions.tsx';

type Props = {
  name: string;
  label: string;
  options: Array<{ id?: string | null; name: string }>;
  defaultValue?: string | null;
  onChange?: (name: string, value: string) => void;
  className?: string;
  srOnly?: boolean;
};

export default function Select({ name, label, options, defaultValue, onChange, className, srOnly = false }: Props) {
  const [value, setValue] = useState(defaultValue);

  const handleChange = useCallback(
    (id: string) => {
      setValue(id);
      if (onChange) onChange(name, id);
    },
    [name, onChange],
  );

  return (
    <Listbox name={name} value={value} onChange={handleChange}>
      {({ open }) => (
        <div className={className}>
          <Listbox.Label className={cx('block text-sm font-medium leading-6 text-gray-900', { 'sr-only': srOnly })}>
            {label}
          </Listbox.Label>
          <div className={cx('relative', { 'mt-1': !srOnly })}>
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm leading-6">
              <span className="block truncate">{options.find((o) => o.id === value)?.name}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <SelectTransition show={open}>
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {options.map((option) => (
                  <Listbox.Option
                    key={option.id}
                    className={({ active }) =>
                      cx(
                        active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-9',
                      )
                    }
                    value={option.id}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={cx(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                          {option.name}
                        </span>

                        {selected ? (
                          <span
                            className={cx(
                              active ? 'text-white' : 'text-indigo-600',
                              'absolute inset-y-0 right-0 flex items-center pr-4',
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
