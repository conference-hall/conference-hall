import { Fragment, useState } from 'react';
import c from 'classnames';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { getLanguage, LANGUAGES } from '../../utils/languages';
import { Text } from '../Typography';

type Props = {
  values: string[];
  className?: string;
};

export default function LanguagesSelect({ values, className }: Props) {
  const [selected, setSelected] = useState<string[]>(values);
  return (
    <Listbox name="languages" value={selected} onChange={setSelected} multiple>
      {({ open }) => (
        <div className={className}>
          <Listbox.Label className="block text-sm font-medium text-gray-700">Languages</Listbox.Label>
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
              {selected.length > 0 ? (
                <Text className="block truncate">{selected.map(getLanguage).join(', ')}</Text>
              ) : (
                <Text variant="secondary" className="block truncate">
                  Select spoken languages for the talk.
                </Text>
              )}
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
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {LANGUAGES.map((language) => (
                  <Listbox.Option
                    key={language.id}
                    value={language.id}
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
                          {language.label}
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
            </Transition>
          </div>
        </div>
      )}
    </Listbox>
  );
}
