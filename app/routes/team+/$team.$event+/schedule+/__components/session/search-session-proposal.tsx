import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { DocumentPlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useFetcher, useParams } from '@remix-run/react';
import type { ChangeEvent } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import type { loader as AutocompleteLoader } from '../../../reviews+/autocomplete.tsx';
import type { ScheduleProposalData } from '../schedule.types.ts';

type SearchSessionProposalProps = {
  onChange: (proposal: ScheduleProposalData | null) => void;
  onClose: () => void;
};

export function SearchSessionProposal({ onChange, onClose }: SearchSessionProposalProps) {
  const { team, event } = useParams();

  const fetcher = useFetcher<typeof AutocompleteLoader>();
  const search = (filters: { query: string }) => {
    fetcher.submit(filters, { action: `/team/${team}/${event}/reviews/autocomplete`, method: 'GET' });
  };

  let results = fetcher.data ?? [];

  const debouncedOnChange = useDebouncedCallback(
    (event: ChangeEvent<HTMLInputElement>) => search({ query: event.target.value }),
    300,
  );

  const handleChange = (value: { intent: string; proposal: ScheduleProposalData | null }) => {
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
    <Combobox as="div" onChange={handleChange} className="absolute inset-0 bg-white z-10">
      {/* Search */}
      <div className="relative border-b border-gray-100">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
        <ComboboxInput
          autoFocus
          className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
          placeholder="Search by proposal titles or speaker names..."
          onChange={debouncedOnChange}
        />
      </div>

      <ComboboxOptions static as="ul" className="max-h-80 scroll-py-2 divide-y divide-gray-100 overflow-y-auto">
        {/* Result list */}
        {results.length > 0 && (
          <li className="p-2">
            <ul className="text-sm text-gray-700">
              {results.map((proposal) => (
                <ComboboxOption
                  as="li"
                  key={proposal.id}
                  value={{ intent: 'proposal', proposal }}
                  className="group flex cursor-default select-none items-center rounded-md px-3 py-2 data-[focus]:bg-gray-100"
                >
                  <div className="flex-auto truncate">
                    <p className="font-semibold truncate">{proposal.title}</p>
                    <p className="text-xs truncate">{proposal?.speakers.map((s) => s.name).join(', ')}</p>
                  </div>
                  <ChevronRightIcon className="ml-3 shrink-0 h-6 w-6 text-gray-400" />
                </ComboboxOption>
              ))}
            </ul>
          </li>
        )}

        {/* Quick actions */}
        <li className="p-2">
          <ul className="text-sm text-gray-700">
            <ComboboxOption
              as="li"
              value={{ intent: 'raw-session' }}
              className="group flex cursor-default select-none items-center rounded-md px-3 py-2 data-[focus]:bg-indigo-600 data-[focus]:text-white"
            >
              <DocumentPlusIcon
                className="h-6 w-6 flex-none text-gray-400 group-data-[focus]:text-white"
                aria-hidden="true"
              />
              <span className="ml-3 flex-auto truncate">Create a raw session...</span>
            </ComboboxOption>
          </ul>
        </li>
      </ComboboxOptions>
    </Combobox>
  );
}
