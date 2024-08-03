import {
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PaintBrushIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useParams } from '@remix-run/react';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '~/design-system/buttons.tsx';
import ColorPicker from '~/design-system/forms/color-picker.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { SelectNative } from '~/design-system/forms/select-native.tsx';
import { TimeRangeInput } from '~/design-system/forms/time-range-input.tsx';
import { IconButton, IconLink } from '~/design-system/icon-buttons.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { getMinutesFromStartOfDay, setMinutesFromStartOfDay } from '~/libs/datetimes/datetimes.ts';

import type { ScheduleSession, Track } from '../schedule.types.ts';
import { SESSION_COLORS } from './constants.ts';
import { SearchSessionProposal } from './search-session-proposal.tsx';

type Props = {
  session: ScheduleSession;
  startTime: Date;
  endTime: Date;
  tracks: Array<Track>;
  isSearching: boolean;
  onFinish: () => void;
  onToggleSearch: () => void;
  onUpdateSession: (current: ScheduleSession, updated: ScheduleSession) => void;
  onDeleteSession: (session: ScheduleSession) => void;
};

export function SessionForm({
  session,
  startTime,
  endTime,
  tracks,
  isSearching,
  onFinish,
  onToggleSearch,
  onUpdateSession,
  onDeleteSession,
}: Props) {
  const { team, event } = useParams();

  const [name, setName] = useState(session.name);
  const [color, setColor] = useState(session.color);
  const [trackId, setTrackId] = useState(session.trackId);
  const [timeslot, setTimeslot] = useState(session.timeslot);
  const [proposal, setProposal] = useState(session.proposal);

  const inputRef = useRef<HTMLInputElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: used for refresh
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [proposal]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onUpdateSession(session, { ...session, name, color, trackId, timeslot, proposal });
    onFinish();
  };

  const handleDelete = () => {
    onDeleteSession(session);
    onFinish();
  };

  return (
    <>
      {isSearching && <SearchSessionProposal onChange={setProposal} onClose={onToggleSearch} />}

      <form id="update-session-form" className="flex flex-col gap-8 px-6 py-6" onSubmit={handleSubmit}>
        {proposal ? (
          <div className="flex items-start justify-between gap-6">
            <div>
              <H2 size="l">{proposal?.title}</H2>
              <Subtitle truncate>{proposal?.speakers.map((s) => s.name).join(', ')}</Subtitle>
            </div>
            <div className="flex gap-2 shrink-0">
              <IconLink
                icon={ArrowTopRightOnSquareIcon}
                label="See proposal"
                to={`/team/${team}/${event}/reviews/${proposal?.id}`}
                variant="secondary"
                target="_blank"
              />
              <IconButton
                icon={MagnifyingGlassIcon}
                label="Search proposals"
                type="button"
                onClick={onToggleSearch}
                variant="secondary"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <Input
              ref={inputRef}
              name="name"
              value={name ?? ''}
              onChange={(e) => setName(e.target.value)}
              placeholder="Session name"
              aria-label="Session name"
              className="grow"
            />
            <IconButton
              icon={MagnifyingGlassIcon}
              label="Search proposals"
              type="button"
              onClick={onToggleSearch}
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
        </div>

        <div className="flex items-center gap-6">
          <MapPinIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden="true" />

          <SelectNative
            name="trackId"
            label="Track"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            options={tracks.map((t) => ({ name: t.name, value: t.id }))}
            srOnly
          />
        </div>

        <div className="flex items-center gap-7">
          <PaintBrushIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden="true" />

          <ColorPicker label="Choose a label color" value={color} onChange={setColor} options={SESSION_COLORS} srOnly />
        </div>
      </form>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 p-6">
        <Button variant="secondary" iconLeft={TrashIcon} onClick={handleDelete}>
          Remove
        </Button>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onFinish}>
            Cancel
          </Button>
          <Button form="update-session-form" type="submit">
            Save session
          </Button>
        </div>
      </div>
    </>
  );
}
