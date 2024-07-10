import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import {
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  DocumentPlusIcon,
  FolderIcon,
  MapPinIcon,
  PaintBrushIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useFetcher } from '@remix-run/react';
import { addMinutes, differenceInMinutes, formatISO, startOfDay } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { useState } from 'react';

import { Button } from '~/design-system/buttons.tsx';
import ColorPicker from '~/design-system/forms/color-picker.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { SelectNative } from '~/design-system/forms/select-native.tsx';
import { TimeRangeInput } from '~/design-system/forms/time-range-input.tsx';
import { IconButton, IconLink } from '~/design-system/icon-buttons.tsx';
import { Background } from '~/design-system/transitions.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';

import type { loader as AutocompleteLoader } from '../../reviews+/autocomplete.tsx';
import type { loader as ScheduleDayLoader } from '../$day.tsx';
import type { ScheduleProposalData, ScheduleSession, Track } from './schedule.types.ts';

type SessionModalProps = {
  session: ScheduleSession;
  startTime: Date;
  endTime: Date;
  timezone: string;
  tracks: Array<Track>;
  onClose: () => void;
};

export function SessionModal({ session, startTime, endTime, timezone, tracks, onClose }: SessionModalProps) {
  const [proposal, setProposal] = useState(session.proposal);

  const [isSearching, setSearching] = useState(false);

  const handleClose = () => {
    if (isSearching) return setSearching(false);
    onClose();
  };

  return (
    <Dialog className="relative z-40" open onClose={handleClose}>
      <Background />

      <div className="fixed inset-0 z-40 overflow-y-auto h-full">
        <div className="flex min-h-full items-end justify-center sm:items-center h-full p-4 overflow-hidden">
          <DialogPanel
            as="div"
            className="relative transform overflow-hidden rounded-lg bg-white text:left shadow-xl transition-all w-full max-w-2xl"
          >
            <DialogTitle className="sr-only">Edit session</DialogTitle>

            {/* Header */}

            {/* Content */}
            {isSearching ? (
              <SearchSessionProposal onChange={setProposal} onClose={() => setSearching(false)} />
            ) : (
              <SessionForm
                session={session}
                proposal={proposal}
                startTime={startTime}
                endTime={endTime}
                timezone={timezone}
                tracks={tracks}
                onOpenSearch={() => setSearching(true)}
                onClose={onClose}
              />
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

type SearchProposalProps = {
  onChange: (proposal: ScheduleProposalData | null) => void;
  onClose: () => void;
};

function SearchSessionProposal({ onChange, onClose }: SearchProposalProps) {
  const [query, setQuery] = useState('');

  // TODOXXX: Limit search results to 3 or 4
  // TODOXXX: Set correct URL with team and event
  const fetcher = useFetcher<typeof AutocompleteLoader>();
  const search = (filters: { query: string }) => {
    fetcher.submit(filters, { action: '/team/gdg-nantes/devfest-nantes/reviews/autocomplete', method: 'GET' });
  };

  const results = fetcher.data?.results ?? [];

  // TODOXXX: Debounce
  const handleChangeQuery = (value: string) => {
    setQuery(value);
    search({ query: value });
  };

  const handleChange = (value: string | ScheduleProposalData) => {
    if (value === 'raw-session') {
      onChange(null);
    } else {
      onChange(value as ScheduleProposalData);
    }
    onClose();
  };

  return (
    <Combobox onChange={handleChange}>
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
          onChange={(event) => handleChangeQuery(event.target.value)}
        />
      </div>

      {(query === '' || results.length > 0) && (
        <ComboboxOptions static as="ul" className="max-h-80 scroll-py-2 divide-y divide-gray-100 overflow-y-auto">
          {/* Result list */}
          {results.length > 0 && (
            <li className="p-2">
              <ul className="text-sm text-gray-700">
                {results.map((proposal) => (
                  <ComboboxOption
                    as="li"
                    key={proposal.id}
                    value={proposal}
                    className="group flex cursor-default select-none items-center rounded-md px-3 py-2 data-[focus]:bg-indigo-600 data-[focus]:text-white"
                  >
                    <span className="ml-3 flex-auto truncate">{proposal.title}</span>
                    <span className="ml-3 hidden flex-none text-indigo-100 group-data-[focus]:inline">Select...</span>
                  </ComboboxOption>
                ))}
              </ul>
            </li>
          )}

          {/* Quick actions */}
          <li className="p-2">
            <h2 className="sr-only">Quick actions</h2>
            <ul className="text-sm text-gray-700">
              <ComboboxOption
                as="li"
                value="raw-session"
                className="group flex cursor-default select-none items-center rounded-md px-3 py-2 data-[focus]:bg-indigo-600 data-[focus]:text-white"
              >
                <DocumentPlusIcon
                  className="h-6 w-6 flex-none text-gray-400 group-data-[focus]:text-white"
                  aria-hidden="true"
                />
                <span className="ml-3 flex-auto truncate">Raw session...</span>
              </ComboboxOption>
            </ul>
          </li>
        </ComboboxOptions>
      )}

      {/* No results */}
      {query !== '' && results.length === 0 && (
        <div className="px-6 py-14 text-center sm:px-14">
          <FolderIcon className="mx-auto h-6 w-6 text-gray-400" aria-hidden="true" />
          <p className="mt-4 text-sm text-gray-900">We couldn't find any proposals with that term. Please try again.</p>
        </div>
      )}
    </Combobox>
  );
}

type Props = {
  session: ScheduleSession;
  proposal?: ScheduleProposalData | null;
  startTime: Date;
  endTime: Date;
  timezone: string;
  tracks: Array<Track>;
  onClose: () => void;
  onOpenSearch: () => void;
};

function SessionForm({ session, proposal, startTime, endTime, timezone, tracks, onClose, onOpenSearch }: Props) {
  const fetcher = useFetcher<typeof ScheduleDayLoader>();

  const [timeslot, setTimeslot] = useState(session.timeslot);

  return (
    <>
      <fetcher.Form
        id="update-session-form"
        method="POST"
        onSubmit={onClose}
        preventScrollReset
        className="flex flex-col gap-8 px-6 py-6"
      >
        {proposal ? (
          <div className="flex items-start justify-between gap-6">
            <div>
              <H2 size="l">{proposal?.title}</H2>
              <Subtitle truncate>{proposal?.speakers.map((s) => s.name).join(', ')}</Subtitle>
            </div>
            <div className="flex gap-2 shrink-0">
              {/* TODOXXX: set correct link */}
              <IconLink
                icon={ArrowTopRightOnSquareIcon}
                label="See proposal"
                to={`/team/gdg-nantes/devfest-nantes/reviews/${proposal?.id}`}
                variant="secondary"
                target="_blank"
              />
              <IconButton
                icon={MagnifyingGlassIcon}
                label="Search proposals"
                type="button"
                onClick={onOpenSearch}
                variant="secondary"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <Input
              name="name"
              defaultValue={session.name ?? ''}
              placeholder="Session name"
              aria-label="Session name"
              className="grow"
            />
            <IconButton
              icon={MagnifyingGlassIcon}
              label="Search proposals"
              type="button"
              onClick={onOpenSearch}
              variant="secondary"
            />
          </div>
        )}

        <div className="flex items-center gap-6">
          <ClockIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden="true" />
          <TimeRangeInput
            nameStart="start-local"
            startTime={getMinutesFromStartOfDay(timeslot.start)}
            nameEnd="end-local"
            endTime={getMinutesFromStartOfDay(timeslot.end)}
            min={getMinutesFromStartOfDay(startTime)}
            max={getMinutesFromStartOfDay(endTime) + 59}
            step={5}
            startRelative
            hideFromLabel
            onChange={(start, end) => {
              setTimeslot({
                start: setMinutesFromStartOfDay(timeslot.start, start),
                end: setMinutesFromStartOfDay(timeslot.start, end),
              });
            }}
          />
          <input type="hidden" name="start" value={formatISO(fromZonedTime(timeslot.start, timezone))} />
          <input type="hidden" name="end" value={formatISO(fromZonedTime(timeslot.end, timezone))} />
        </div>

        <div className="flex items-center gap-6">
          <MapPinIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden="true" />
          <SelectNative
            name="trackId"
            label="Track"
            defaultValue={session.trackId}
            options={tracks.map((t) => ({ name: t.name, value: t.id }))}
            srOnly
          />
        </div>

        <div className="flex items-center gap-7">
          <PaintBrushIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden="true" />
          <ColorPicker label="Choose a label color" srOnly />
        </div>

        <input type="hidden" name="id" value={session.id} />
        <input type="hidden" name="proposalId" value={proposal ? proposal.id : ''} />
      </fetcher.Form>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 p-6">
        <fetcher.Form method="POST" onSubmit={onClose} preventScrollReset>
          <input type="hidden" name="id" value={session.id} />
          <Button type="submit" name="intent" value="delete-session" variant="secondary" iconLeft={TrashIcon}>
            Remove
          </Button>
        </fetcher.Form>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" name="intent" value="update-session" form="update-session-form">
            Save session
          </Button>
        </div>
      </div>
    </>
  );
}

// TODOXXX: extract
function getMinutesFromStartOfDay(date: Date): number {
  return differenceInMinutes(date, startOfDay(date));
}

// TODOXXX: extract
function setMinutesFromStartOfDay(date: Date, minutes: number): Date {
  return addMinutes(startOfDay(date), minutes);
}
