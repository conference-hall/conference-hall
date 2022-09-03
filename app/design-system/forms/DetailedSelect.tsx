import { Fragment, useCallback } from 'react';
import c from 'classnames';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

type Props = {
  name: string;
  label: string;
  options: { id: string; label: string; description?: string }[];
  value?: string;
  onChange?: (name: string, value: string) => void;
  className?: string;
};

export default function DetailedSelect({ name, label, options, value, onChange, className }: Props) {
  const handleChange = useCallback(
    (id: string) => {
      if (onChange) onChange(name, id);
    },
    [name, onChange]
  );

  return (
    <Listbox name={name} value={value} onChange={handleChange}>
      {({ open }) => (
        <>
          <Listbox.Label className="sr-only">{label}</Listbox.Label>
          <div className="relative">
            <Listbox.Button
              className={c(
                className,
                'relative inline-flex items-center rounded-md p-2 text-sm text-gray-900 focus:z-10 focus:outline-none focus:ring-2 focus:ring-gray-500'
              )}
            >
              <p className="mx-2.5 text-sm">{options.find((o) => o.id === value)?.label}</p>
              <span className="sr-only">{label}</span>
              <ChevronDownIcon className="h-5 w-5 text-gray-900" aria-hidden="true" />
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-2 divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:right-0 sm:w-72 sm:origin-top-right">
                {options.map((option) => (
                  <Listbox.Option
                    key={option.id}
                    value={option.id}
                    className={({ active }) =>
                      c(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-900',
                        'relative cursor-default select-none px-4 py-4 text-sm'
                      )
                    }
                  >
                    {({ selected, active }) => (
                      <div className="flex flex-col">
                        <div className="flex justify-between">
                          <p className={selected ? 'font-semibold' : 'font-normal'}>{option.label}</p>
                          {selected ? (
                            <CheckIcon className="hidden h-5 w-5 text-indigo-500 sm:inline-block" aria-hidden="true" />
                          ) : null}
                        </div>
                        {option.description && (
                          <p className={c(active ? 'text-gray-900' : 'text-gray-500', 'mt-2')}>{option.description}</p>
                        )}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}
