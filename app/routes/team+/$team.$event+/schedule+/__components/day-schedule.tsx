import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { endOfDay, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { useState } from 'react';

import { ButtonLink } from '~/design-system/buttons.tsx';
import { Page } from '~/design-system/layouts/page.tsx';

import { ScheduleHeader } from './header/schedule-header.tsx';
import { useScheduleFullscreen } from './header/use-schedule-fullscreen.tsx';
import { useZoomHandlers } from './header/use-zoom-handlers.tsx';
import Schedule from './schedule/schedule.tsx';
import type { Session, TimeSlot, Track } from './schedule/types.ts';
import { SessionBlock } from './session-block.tsx';
import { SessionModal } from './session-modal.tsx';

export type DaySetting = { id: string; day: string; startTime: string; endTime: string };

type Props = {
  name: string;
  timezone: string;
  currentDay: string;
  previousDayIndex: number | null;
  nextDayIndex: number | null;
  tracks: Array<Track>;
  sessions: Array<Session>;
  onAddSession: (trackId: string, timeslot: TimeSlot) => void;
  onUpdateSession: (session: Session, newTrackId: string, newTimeslot: TimeSlot) => void;
};

export function DaySchedule({
  name,
  timezone,
  currentDay,
  previousDayIndex,
  nextDayIndex,
  tracks,
  sessions,
  onAddSession,
  onUpdateSession,
}: Props) {
  const currentDayDate = toZonedTime(currentDay, timezone);
  const startTime = startOfDay(currentDayDate);
  const endTime = endOfDay(currentDayDate);

  const { isFullscreen } = useScheduleFullscreen();

  const zoomHandlers = useZoomHandlers();

  const [openSession, setOpenSession] = useState<Session | null>(null);
  const onCloseSession = () => setOpenSession(null);

  return (
    <main className={cx({ 'px-8 my-8 mx-auto max-w-7xl': !isFullscreen })}>
      {!isFullscreen ? (
        <Page.Heading title={name}>
          <ButtonLink to="../settings" variant="secondary" relative="path" iconLeft={Cog6ToothIcon}>
            Settings
          </ButtonLink>
        </Page.Heading>
      ) : null}

      <div className={cx({ 'border border-gray-200 rounded-t-lg': !isFullscreen })}>
        <SessionModal session={openSession} tracks={tracks} onClose={onCloseSession} />

        {currentDayDate ? (
          <>
            <ScheduleHeader
              currentDay={currentDayDate}
              previousDayIndex={previousDayIndex}
              nextDayIndex={nextDayIndex}
              zoomHandlers={zoomHandlers}
            />

            <Schedule
              day={currentDayDate}
              startTime={startTime}
              endTime={endTime}
              timezone={timezone}
              tracks={tracks}
              sessions={sessions}
              zoomLevel={zoomHandlers.level}
              onSelectSession={setOpenSession}
              onAddSession={onAddSession}
              onUpdateSession={onUpdateSession}
              renderSession={(session) => <SessionBlock session={session} />}
            />
          </>
        ) : null}
      </div>
    </main>
  );
}
