import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { DocumentPlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { type ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFetcher, useParams } from 'react-router';
import { useDebouncedCallback } from 'use-debounce';
import type { loader as AutocompleteLoader } from '../../../proposals/autocomplete.tsx';
import type { ScheduleProposalData } from '../schedule.types.ts';

type SearchSessionProposalProps = {
  onChange: (proposal: ScheduleProposalData | null) => void;
  onClose: VoidFunction;
};

type ComboboxValue = { intent: string | null; proposal: ScheduleProposalData | null } | null;

export function SearchSessionProposal({ onChange, onClose }: SearchSessionProposalProps) {
  const { t } = useTranslation();
  const { team, event } = useParams();
  const [value] = useState<ComboboxValue>(null);

  const fetcher = useFetcher<typeof AutocompleteLoader>();
  const search = (filters: { query: string }) => {
    fetcher.submit(filters, { action: `/team/${team}/${event}/proposals/autocomplete`, method: 'GET' });
  };

  const results = fetcher.data ?? [];

  const debouncedOnChange = useDebouncedCallback(
    (event: ChangeEvent<HTMLInputElement>) => search({ query: event.target.value }),
    300,
  );

  const handleChange = (value: ComboboxValue | null) => {
    if (!value) return;
    if (value.intent === 'raw-session') {
      onChange(null);
      onClose();
    } else if (value.intent === 'proposal') {
      onChange(value.proposal);
      onClose();
    }
  };

  return (
    <Combobox as="div" value={value} onChange={handleChange} className="absolute inset-0 z-10 bg-white">
      {/* Search */}
      <div className="relative border-gray-100 border-b">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
        <ComboboxInput
          autoFocus
          className="h-12 w-full border-0 bg-transparent pr-4 pl-11 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
          placeholder={t('event-management.schedule.edit-session.proposal.search.placeholder')}
          onChange={debouncedOnChange}
        />
      </div>

      <ComboboxOptions static as="ul" className="max-h-80 scroll-py-2 divide-y divide-gray-100 overflow-y-auto">
        {/* Result list */}
        {results.length > 0 && (
          <li className="p-2">
            <ul className="text-gray-700 text-sm">
              {results.map((proposal) => (
                <ComboboxOption
                  as="li"
                  key={proposal.id}
                  value={{ intent: 'proposal', proposal }}
                  className="group flex cursor-default select-none items-center rounded-md px-3 py-2 data-focus:bg-gray-100"
                >
                  <div className="flex-auto truncate">
                    <p className="truncate font-semibold">{proposal.title}</p>
                    <p className="truncate text-xs">{proposal?.speakers.map((s) => s.name).join(', ')}</p>
                  </div>
                  <ChevronRightIcon className="ml-3 h-6 w-6 shrink-0 text-gray-400" />
                </ComboboxOption>
              ))}
            </ul>
          </li>
        )}

        {/* Quick actions */}
        <li className="p-2">
          <ul className="text-gray-700 text-sm">
            <ComboboxOption
              as="li"
              value={{ intent: 'raw-session' }}
              className="group flex cursor-default select-none items-center rounded-md px-3 py-2 data-focus:bg-indigo-600 data-focus:text-white"
            >
              <DocumentPlusIcon
                className="h-6 w-6 flex-none text-gray-400 group-data-focus:text-white"
                aria-hidden="true"
              />
              <span className="ml-3 flex-auto truncate">{t('event-management.schedule.edit-session.create-raw')}</span>
            </ComboboxOption>
          </ul>
        </li>
      </ComboboxOptions>
    </Combobox>
  );
}
