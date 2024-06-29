import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useState } from 'react';

import { IconButton, IconLink } from '~/design-system/icon-buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';

import Schedule from './schedule/schedule.tsx';
import type { Session } from './schedule/types.ts';
import { formatTimeSlot } from './schedule/utils/timeslots.ts';
import { SessionFormModal } from './session-form.tsx';
import type { ScheduleSettings } from './settings-form.tsx';

type Props = { settings: ScheduleSettings };

export default function EventSchedule({ settings }: Props) {
  const [expanded, setExpanded] = useState(false);

  const [zoomLevel, setZoomLevel] = useState(2);
  const zoomIn = () => setZoomLevel((z) => Math.min(z + 1, 4));
  const zoomOut = () => setZoomLevel((z) => Math.max(z - 1, 0));

  const [openSession, setOpenSession] = useState<Session | null>(null);
  const onCloseSession = () => setOpenSession(null);

  return (
    <main className={cx('px-8 my-8', { 'mx-auto max-w-7xl': !expanded })}>
      <Card>
        <SessionFormModal session={openSession} tracks={settings.tracks} onClose={onCloseSession} />

        <header className="flex flex-row items-center justify-between gap-4 p-4 px-6 rounded-t-lg bg-slate-100">
          <div className="flex items-center gap-2">
            <IconButton icon={ChevronLeftIcon} label="Previous day" onClick={() => {}} variant="secondary" />
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              <time dateTime="2022-01-01">January 1st 2022</time>
            </h1>
            <IconButton icon={ChevronRightIcon} label="Next day" onClick={() => {}} variant="secondary" />
          </div>
          <div className="flex items-center gap-4">
            <IconButton icon={MagnifyingGlassPlusIcon} label="Zoom in" onClick={zoomIn} variant="secondary" />
            <IconButton icon={MagnifyingGlassMinusIcon} label="Zoom out" onClick={zoomOut} variant="secondary" />
            {expanded ? (
              <IconButton
                icon={ArrowsPointingInIcon}
                label="Collapse schedule"
                onClick={() => setExpanded(false)}
                variant="secondary"
              />
            ) : (
              <IconButton
                icon={ArrowsPointingOutIcon}
                label="Expand schedule"
                onClick={() => setExpanded(true)}
                variant="secondary"
              />
            )}

            <IconLink icon={Cog6ToothIcon} label="Schedule settings" to="settings" variant="secondary" />
          </div>
        </header>

        <Schedule
          startTime={settings.startTime}
          endTime={settings.endTime}
          tracks={settings.tracks}
          initialSessions={[]}
          onAddSession={setOpenSession}
          onSelectSession={setOpenSession}
          renderSession={(session, zoomLevel, oneLine) => (
            <SessionBlock session={session} zoomLevel={zoomLevel} oneLine={oneLine} />
          )}
          zoomLevel={zoomLevel}
        />
      </Card>
    </main>
  );
}

type SessionBlockProps = { session: Session; zoomLevel: number; oneLine: boolean };

function SessionBlock({ session, zoomLevel, oneLine }: SessionBlockProps) {
  return (
    <div
      className={cx(
        'text-xs h-full px-1 text-indigo-400 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded',
        {
          'p-1': !oneLine && zoomLevel >= 3,
          'flex gap-1': oneLine,
        },
      )}
    >
      <p className="truncate">{formatTimeSlot(session.timeslot)}</p>
      <p className="font-semibold truncate">(No title)</p>
    </div>
  );
}
