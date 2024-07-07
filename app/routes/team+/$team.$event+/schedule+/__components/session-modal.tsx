import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Fieldset,
  Label,
  Legend,
  Radio,
  RadioGroup,
  Transition,
} from '@headlessui/react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { ArrowTopRightOnSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { addMinutes, differenceInMinutes, startOfDay } from 'date-fns';
import { useState } from 'react';

import { Badge } from '~/design-system/badges.tsx';
import { Button, button } from '~/design-system/buttons.tsx';
import { Divider } from '~/design-system/divider.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { SelectNative } from '~/design-system/forms/select-native.tsx';
import { TimeRangeInput } from '~/design-system/forms/time-range-input.tsx';
import { IconButton, IconLink } from '~/design-system/icon-buttons.tsx';
import { Background, ModalTransition } from '~/design-system/transitions.tsx';
import { H2, Text } from '~/design-system/typography.tsx';
import { SpeakerPill } from '~/routes/__components/talks/co-speaker.tsx';

import type { Session, TimeSlot, Track } from './schedule/types.ts';

const SPEAKERS = [
  { id: '1', name: 'John parker', picture: 'https://i.pravatar.cc/150?img=11' },
  { id: '2', name: 'John parker', picture: 'https://i.pravatar.cc/150?img=11' },
  { id: '3', name: 'John parker', picture: 'https://i.pravatar.cc/150?img=11' },
];

const FILTER_OPTIONS = [
  { name: 'Accepted', value: 'accepted' },
  { name: 'Pending', value: 'pending' },
  { name: 'Rejected', value: 'rejected' },
  { name: 'All', value: 'all' },
];

type SessionModalProps = {
  open: boolean;
  session: Session; // TODO: should not be nullable
  startTime: Date;
  endTime: Date;
  tracks: Array<Track>;
  onDeleteSession: (session: Session) => void;
  onUpdateSession: (session: Session, newTrackId: string, newTimeslot: TimeSlot) => void;
  onClose: () => void;
};

export function SessionModal({
  open,
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
  const [isSearching, setSearching] = useState(false);

  const handleSave = () => {
    onUpdateSession(session, trackId, timeslot);
    onClose();
  };

  const handleDelete = () => {
    onDeleteSession(session);
    onClose();
  };

  return (
    <Transition show={open}>
      <Dialog className="relative z-40" onClose={onClose}>
        <Background />

        <div className="fixed inset-0 z-40 overflow-y-auto h-full">
          <div className="flex min-h-full items-end justify-center sm:items-center h-full p-4 overflow-hidden">
            <ModalTransition>
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
                {isSearching ? (
                  <div className="space-y-1 p-4 min-h-72">
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        name="query"
                        icon={MagnifyingGlassIcon}
                        type="search"
                        placeholder="Search proposals by title or speakers"
                        aria-label="Search proposals"
                        className="w-full"
                      />
                      <IconButton
                        icon={XMarkIcon}
                        label="Go back"
                        onClick={() => setSearching(false)}
                        variant="secondary"
                      />
                    </div>
                    <div>
                      <FiltersRadio
                        label="Filters"
                        name="name"
                        value="accepted"
                        onChange={console.log}
                        options={FILTER_OPTIONS}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 min-h-72">
                    <div className="flex items-center justify-between gap-2">
                      <H2 size="l" truncate>
                        Le web ou la typographie
                      </H2>
                      <div className="flex gap-2">
                        {/* TODO: set correct link */}
                        <IconLink
                          icon={ArrowTopRightOnSquareIcon}
                          label="See proposal"
                          to="/team/gdg-nantes/devfest-nantes/reviews"
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
                    <div className="flex flex-wrap gap-2">
                      {SPEAKERS.map((s) => (
                        <SpeakerPill key={s.id} speaker={s} />
                      ))}
                    </div>
                    <div className="space-y-1">
                      <Text>Formats: Quickie</Text>
                      <Text>Category: Web, Cloud</Text>
                    </div>
                    <div className="space-x-2">
                      <Badge color="blue">Intermediate</Badge>
                      <Badge>French</Badge>
                      <Badge>English</Badge>
                    </div>
                  </div>
                )}

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
            </ModalTransition>
          </div>
        </div>
      </Dialog>
    </Transition>
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

type FiltersRadioProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ name: string; value: string }>;
  className?: string;
};

function FiltersRadio({ label, name, value, onChange, options, className }: FiltersRadioProps) {
  return (
    <Fieldset className={className}>
      <Legend className="sr-only">{label}</Legend>
      <RadioGroup name={name} value={value} onChange={onChange}>
        <div className="flex gap-2 flex-wrap mt-1">
          {options.map((option) => (
            <Radio
              key={option.name}
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
