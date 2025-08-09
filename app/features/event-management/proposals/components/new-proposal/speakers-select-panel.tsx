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
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { href, useFetcher } from 'react-router';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '~/design-system/forms/input.tsx';
import { menuItem, menuItems } from '~/design-system/styles/menu.styles.ts';
import { H2, Label, Text } from '~/design-system/typography.tsx';
import type { loader as AutocompleteLoader } from '../../../command-palette/autocomplete.ts';

type Speaker = { id: string; name: string };

type Props = {
  team: string;
  event: string;
  form: string;
  name?: string;
  defaultValue?: Speaker[];
  onChange: (speakers: Speaker[]) => void;
};

export function SpeakersSelectPanel({ team, event, form, name = 'speakers', defaultValue = [], onChange }: Props) {
  const { t } = useTranslation();
  const fetcher = useFetcher<typeof AutocompleteLoader>();

  const loading = ['loading', 'submitting'].includes(fetcher.state);

  const [selectedSpeakers, setSelectedSpeakers] = useState<Speaker[]>(defaultValue);
  const [query, setQuery] = useState('');
  const [typing, setTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLoading = loading || typing;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    const searchParams = new URLSearchParams();
    searchParams.append('query', searchQuery);
    searchParams.append('kind', 'speakers');

    const autocompleteRoute = href('/team/:team/:event/autocomplete', { team, event });
    await fetcher.load(`${autocompleteRoute}?${searchParams.toString()}`);
    setTyping(false);
  }, 300);

  const availableOptions = useMemo(() => {
    const searchOptions =
      fetcher.data?.map((item) => ({
        id: item.id,
        name: item.title,
      })) ?? [];

    const filteredSelectedSpeakers = selectedSpeakers.filter(
      (option) => !searchOptions.find((speaker) => speaker.id === option.id),
    );

    return [...filteredSelectedSpeakers, ...searchOptions];
  }, [fetcher.data, selectedSpeakers]);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setTyping(true);
    setQuery(value);
    debouncedSearch(value);
  };

  const handleSelectionChange = (speakers: Speaker[]) => {
    setSelectedSpeakers(speakers);
    onChange(speakers);
  };

  return (
    <Field className="relative">
      <Label className="sr-only">Speakers</Label>

      {/* Hidden inputs for form submission */}
      {selectedSpeakers.map((speaker) => (
        <input key={speaker.id} type="hidden" name={name} value={speaker.id} form={form} />
      ))}

      <Popover>
        {({ open }) => {
          if (open !== isOpen) {
            setIsOpen(open);
          }
          return (
            <>
              <PopoverButton className="w-full cursor-pointer">
                <div className="flex items-center justify-between group">
                  <H2 size="s" className="group-hover:text-indigo-600">
                    Speakers
                  </H2>
                  <Cog6ToothIcon className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" role="presentation" />
                </div>
              </PopoverButton>

              <PopoverPanel className={cx('mt-1', menuItems('w-(--button-width)'))} anchor="bottom">
                <Combobox value={selectedSpeakers} onChange={handleSelectionChange} multiple by="id">
                  <Text weight="medium" className="px-2 ml-1">
                    Speakers
                  </Text>

                  <ComboboxInput as={Fragment} onChange={handleQueryChange}>
                    <Input
                      ref={inputRef}
                      type="text"
                      size="s"
                      className="w-full p-2 border-b border-b-gray-200 text-sm"
                      placeholder={t('common.search.placeholder')}
                      value={query}
                    />
                  </ComboboxInput>

                  <ComboboxOptions className="max-h-48 pt-2 overflow-y-auto" static>
                    {availableOptions.map((speaker) => (
                      <ComboboxOption key={speaker.id} value={speaker} className={menuItem()}>
                        {({ selected }) => (
                          <div className="flex items-center justify-between gap-2 truncate">
                            <input
                              id={`checkbox-${speaker.id}`}
                              type="checkbox"
                              checked={selected}
                              onChange={(e) => e.preventDefault()}
                              className="h-4 w-4 rounded-sm border-gray-300 text-indigo-600 focus:ring-0 outline-none"
                            />
                            <Text truncate>{speaker.name}</Text>
                          </div>
                        )}
                      </ComboboxOption>
                    ))}

                    {availableOptions.length === 0 && !isLoading ? (
                      <Text size="xs" variant="secondary" className="px-4 py-2">
                        {t('common.no-results')}
                      </Text>
                    ) : null}
                  </ComboboxOptions>
                </Combobox>
              </PopoverPanel>
            </>
          );
        }}
      </Popover>
    </Field>
  );
}
