import { Fragment, useCallback } from 'react';
import c from 'classnames';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

type Props = {
  name: string;
  label: string;
  options: { id: string; label: string; description?: string }[];
  value?: string;
  onChange?: (name: string, value: string) => void;
  className?: string;
  srOnly?: boolean;
};

export default function Select({ name, label, options, value, onChange, className, srOnly = false }: Props) {
  const handleChange = useCallback(
    (id: string) => {
      if (onChange) onChange(name, id);
    },
    [name, onChange]
  );

  return (
    <Listbox name={name} value={value} onChange={handleChange}>
      {({ open }) => (
        <div className={className}>
          <Listbox.Label className={c('block text-sm font-medium text-gray-900', { 'sr-only': srOnly })}>
            {label}
          </Listbox.Label>
          <div className={c('relative', { 'mt-1': !srOnly })}>
            <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
              <span className="block truncate">{options.find((o) => o.id === value)?.label}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {options.map((option) => (
                  <Listbox.Option
                    key={option.id}
                    className={({ active }) =>
                      c(
                        active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-8 pr-4'
                      )
                    }
                    value={option.id}
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
                              'absolute inset-y-0 left-0 flex items-center pl-1.5'
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
            </Transition>
          </div>
        </div>
      )}
    </Listbox>
  );
}
