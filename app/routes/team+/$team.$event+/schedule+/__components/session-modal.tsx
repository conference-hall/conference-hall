import { Dialog, DialogPanel, DialogTitle, Fieldset, Label, Legend, Radio, RadioGroup } from '@headlessui/react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { ArrowTopRightOnSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useFetcher } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import { addMinutes, differenceInMinutes, startOfDay } from 'date-fns';
import type { ChangeEvent } from 'react';
import { useState } from 'react';

import { Button, button } from '~/design-system/buttons.tsx';
import { Divider } from '~/design-system/divider.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { SelectNative } from '~/design-system/forms/select-native.tsx';
import { TimeRangeInput } from '~/design-system/forms/time-range-input.tsx';
import { IconButton, IconLink } from '~/design-system/icon-buttons.tsx';
import { Background } from '~/design-system/transitions.tsx';
import { H2, Subtitle, Text } from '~/design-system/typography.tsx';

import type { loader } from '../../reviews+/autocomplete.tsx';
import type { ScheduleProposalData, ScheduleSession, TimeSlot, Track } from './schedule.types.ts';

const FILTER_OPTIONS = [
  { name: 'Accepted', value: 'accepted' },
  { name: 'Pending', value: 'pending' },
  { name: 'Rejected', value: 'rejected' },
  { name: 'All', value: '' },
];

type SessionModalProps = {
  session: ScheduleSession;
  startTime: Date;
  endTime: Date;
  tracks: Array<Track>;
  onDeleteSession: (session: ScheduleSession) => void;
  onUpdateSession: (session: ScheduleSession, newTrackId: string, newTimeslot: TimeSlot, proposalId?: string) => void;
  onClose: () => void;
};

export function SessionModal({
  session,
  startTime,
  endTime,
  tracks,
  onDeleteSession,
  onUpdateSession,
  onClose,
}: SessionModalProps) {
  const [timeslot, setTimeslot] = useState(session.timeslot);
  const [trackId, setTrackId] = useState(session.trackId);
  const [proposal, setProposal] = useState(session.proposal);
  const [isSearching, setSearching] = useState(!session.proposal);

  const handleSave = () => {
    onUpdateSession(session, trackId, timeslot, proposal?.id);
    onClose();
  };

  const handleDelete = () => {
    onDeleteSession(session);
    onClose();
  };

  return (
    <Dialog className="relative z-40" open onClose={onClose}>
      <Background />

      <div className="fixed inset-0 z-40 overflow-y-auto h-full">
        <div className="flex min-h-full items-end justify-center sm:items-center h-full p-4 overflow-hidden">
          <DialogPanel
            as="div"
            className="relative transform overflow-hidden rounded-lg bg-white text:left shadow-xl transition-all w-full max-w-2xl"
          >
            <DialogTitle className="sr-only">Edit session</DialogTitle>

            {/* Header */}
            <div className="flex items-center justify-between gap-2 p-4 bg-slate-50">
              <TimeRangeInput
                startTime={getMinutesFromStartOfDay(timeslot.start)}
                endTime={getMinutesFromStartOfDay(timeslot.end)}
                min={getMinutesFromStartOfDay(startTime)}
                max={getMinutesFromStartOfDay(endTime) + 59}
                step={5}
                startRelative
                onChange={(start, end) => {
                  setTimeslot({
                    start: setMinutesFromStartOfDay(timeslot.start, start),
                    end: setMinutesFromStartOfDay(timeslot.start, end),
                  });
                }}
              />
              <SelectNative
                name="trackId"
                label="Track"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                options={tracks.map((t) => ({ name: t.name, value: t.id }))}
                srOnly
              />
            </div>

            <Divider />

            {/* Content */}
            <div className="space-y-1 p-4 min-h-72">
              {isSearching ? (
                <SearchProposal onChangeProposal={setProposal} onClose={() => setSearching(false)} />
              ) : proposal ? (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <H2 size="l">{proposal?.title}</H2>
                      <Subtitle truncate>{proposal.speakers.map((s) => s.name).join(', ')}</Subtitle>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {/* TODO: set correct link */}
                      <IconLink
                        icon={ArrowTopRightOnSquareIcon}
                        label="See proposal"
                        to={`/team/gdg-nantes/devfest-nantes/reviews/${proposal.id}`}
                        variant="secondary"
                        target="_blank"
                      />
                      <IconButton
                        icon={MagnifyingGlassIcon}
                        label="Search proposals"
                        onClick={() => setSearching(true)}
                        variant="secondary"
                      />
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <Divider />

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 p-4 bg-slate-50">
              <Button variant="secondary" iconLeft={TrashIcon} onClick={handleDelete}>
                Remove
              </Button>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

// TODO: extract
function getMinutesFromStartOfDay(date: Date): number {
  return differenceInMinutes(date, startOfDay(date));
}

// TODO: extract
function setMinutesFromStartOfDay(date: Date, minutes: number): Date {
  return addMinutes(startOfDay(date), minutes);
}

type SearchProposalProps = {
  onChangeProposal: (proposal: ScheduleProposalData) => void;
  onClose: () => void;
};

function SearchProposal({ onChangeProposal, onClose }: SearchProposalProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('accepted');

  // TODO: Limit search results to 3 or 4
  // TODO: Set correct URL with team and event
  const fetcher = useFetcher<typeof loader>();
  const search = (filters: { query: string; status: string }) => {
    fetcher.submit(filters, { action: '/team/gdg-nantes/devfest-nantes/reviews/autocomplete', method: 'GET' });
  };

  // TODO: Debounce
  const handleChangeQuery = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    search({ query: event.target.value, status });
  };

  const handleChangeStatus = (value: string) => {
    setStatus(value);
    search({ query, status: value });
  };

  const handleChangeProposal = (proposal: ScheduleProposalData) => {
    onChangeProposal(proposal);
    onClose();
  };

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <Input
          name="query"
          icon={MagnifyingGlassIcon}
          type="search"
          placeholder="Search proposals by title or speakers"
          aria-label="Search proposals"
          value={query}
          onChange={handleChangeQuery}
          className="w-full"
        />
        <IconButton icon={XMarkIcon} label="Go back" onClick={onClose} variant="secondary" />
      </div>
      <div>
        <FiltersRadio
          label="Filters"
          name="name"
          value={status}
          onChange={handleChangeStatus}
          options={FILTER_OPTIONS}
        />
      </div>

      <ul>
        {fetcher.data?.results?.map((proposal) => (
          <li key={proposal.id}>
            <Text>{proposal.title}</Text>
            <Button onClick={() => handleChangeProposal(proposal)}>Select</Button>
          </li>
        ))}
      </ul>
    </>
  );
}

type FiltersRadioProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ name: string; value: string }>;
  className?: string;
};

function FiltersRadio({ label, value, onChange, options, className }: FiltersRadioProps) {
  return (
    <Fieldset className={className}>
      <Legend className="sr-only">{label}</Legend>
      <RadioGroup value={value} onChange={onChange}>
        <div className="flex gap-2 flex-wrap mt-1">
          {options.map((option) => (
            <Radio
              key={option.value}
              value={option.value}
              className={({ checked }) =>
                cx('cursor-pointer', button({ variant: 'secondary', size: 's' }), {
                  '!bg-indigo-100 ring-indigo-200 text-indigo-700 hover:bg-indigo-100': checked,
                })
              }
            >
              <Label>{option.name}</Label>
            </Radio>
          ))}
        </div>
      </RadioGroup>
    </Fieldset>
  );
}
