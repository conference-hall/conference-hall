import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
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
  currentDayId: string;
  days: Array<DaySetting>;
  tracks: Array<Track>;
  sessions: Array<Session>;
  onAddSession: (trackId: string, timeslot: TimeSlot) => void;
  onUpdateSession: (session: Session, newTrackId: string, newTimeslot: TimeSlot) => void;
};

export function DaySchedule({ name, currentDayId, days, tracks, sessions, onAddSession, onUpdateSession }: Props) {
  const { isFullscreen } = useScheduleFullscreen();

  const zoomHandlers = useZoomHandlers();

  const [openSession, setOpenSession] = useState<Session | null>(null);
  const onCloseSession = () => setOpenSession(null);

  const { currentDay, previousDay, nextDay } = getDayNavigation(days, currentDayId);

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

        {currentDay ? (
          <>
            <ScheduleHeader
              currentDay={new Date(currentDay.day)}
              previousDayId={previousDay?.id}
              nextDayId={nextDay?.id}
              zoomHandlers={zoomHandlers}
            />

            <Schedule
              day={new Date(currentDay.day)}
              startTime={currentDay.startTime}
              endTime={currentDay.endTime}
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

function getDayNavigation(days: Array<DaySetting>, currentDayId: string) {
  if (!days.length) return { currentDay: null, previousDay: null, nextDay: null };

  const currentIndex = currentDayId ? days.findIndex((day) => day.id === currentDayId) : 0;

  const currentDay = days[currentIndex] || null;
  const previousDay = currentIndex > 0 ? days[currentIndex - 1] : null;
  const nextDay = currentIndex < days.length - 1 ? days[currentIndex + 1] : null;

  return { currentDay, previousDay, nextDay };
}
