import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  Cog6ToothIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { format } from 'date-fns';
import { useState } from 'react';

import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { IconButton, IconLink } from '~/design-system/icon-buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2 } from '~/design-system/typography.tsx';

import Schedule from './schedule/schedule.tsx';
import type { Session, Track } from './schedule/types.ts';
import { formatTimeSlot } from './schedule/utils/timeslots.ts';
import { SessionFormModal } from './session-form.tsx';

const ZOOM_LEVEL_DEFAULT = 0;
const ZOOM_LEVEL_MAX = 3;

type Props = {
  currentDayId: string;
  schedule: {
    name: string;
    startTimeslot: string;
    endTimeslot: string;
    intervalMinutes: number;
    days: Array<{ id: string; day: string }>;
    tracks: Array<Track>;
  };
};

export function DaySchedule({ currentDayId, schedule }: Props) {
  const [expanded, setExpanded] = useState(false);

  const [zoomLevel, setZoomLevel] = useState(ZOOM_LEVEL_DEFAULT);
  const zoomIn = () => setZoomLevel((z) => Math.min(z + 1, ZOOM_LEVEL_MAX));
  const zoomOut = () => setZoomLevel((z) => Math.max(z - 1, 0));

  const [openSession, setOpenSession] = useState<Session | null>(null);
  const onCloseSession = () => setOpenSession(null);

  const { currentDay, previousDay, nextDay } = getDayNavigation(schedule.days, currentDayId);

  return (
    <main className={cx('px-8 my-8', { 'mx-auto max-w-7xl': !expanded })}>
      <Page.Heading title={schedule.name}>
        <ButtonLink to="../settings" variant="secondary" relative="path" iconLeft={Cog6ToothIcon}>
          Settings
        </ButtonLink>
      </Page.Heading>

      <Card>
        <SessionFormModal session={openSession} tracks={schedule.tracks} onClose={onCloseSession} />

        <header className="flex flex-row items-center justify-between gap-4 p-4 px-6 rounded-t-lg bg-slate-100">
          <div className="flex items-center gap-3 shrink">
            <IconLink
              icon={ChevronLeftIcon}
              label="Previous day"
              to={`../${previousDay ? previousDay.id : currentDayId}`}
              relative="path"
              disabled={!previousDay}
              variant="secondary"
            />
            <H2 truncate>
              {currentDay ? (
                <time dateTime={format(currentDay.day, 'yyyy-MM-dd')}>{format(currentDay.day, 'PPPP')}</time>
              ) : null}
            </H2>
            <IconLink
              icon={ChevronRightIcon}
              label="Next day"
              to={`../${nextDay ? nextDay.id : currentDayId}`}
              relative="path"
              disabled={!nextDay}
              variant="secondary"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="mr-1 pr-6 border-r border-gray-300">
              <Button onClick={() => {}} variant="secondary" iconLeft={ClockIcon}>
                {`${schedule.startTimeslot} to ${schedule.endTimeslot}`}
              </Button>
            </div>
            <IconButton
              icon={MagnifyingGlassPlusIcon}
              label="Zoom in"
              onClick={zoomIn}
              disabled={zoomLevel === ZOOM_LEVEL_MAX}
              variant="secondary"
            />
            <IconButton
              icon={MagnifyingGlassMinusIcon}
              label="Zoom out"
              onClick={zoomOut}
              disabled={zoomLevel === 0}
              variant="secondary"
            />
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
          </div>
        </header>

        <Schedule
          startTime={schedule.startTimeslot}
          endTime={schedule.endTimeslot}
          interval={schedule.intervalMinutes}
          tracks={schedule.tracks}
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

function getDayNavigation(days: Array<{ id: string; day: string }>, currentDayId: string) {
  if (!days.length) return { currentDay: null, previousDay: null, nextDay: null };

  const currentIndex = currentDayId ? days.findIndex((day) => day.id === currentDayId) : 0;

  const currentDay = days[currentIndex] || null;
  const previousDay = currentIndex > 0 ? days[currentIndex - 1] : null;
  const nextDay = currentIndex < days.length - 1 ? days[currentIndex + 1] : null;

  return { currentDay, previousDay, nextDay };
}
