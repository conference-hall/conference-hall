import { cx } from 'class-variance-authority';
import { useState } from 'react';

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
  currentDay: Date;
  startTime: Date;
  endTime: Date;
  timezone: string;
  previousDayIndex: number | null;
  nextDayIndex: number | null;
  tracks: Array<Track>;
  sessions: Array<Session>;
  onAddSession: (trackId: string, timeslot: TimeSlot) => void;
  onUpdateSession: (session: Session, newTrackId: string, newTimeslot: TimeSlot) => void;
  onChangeDisplayTime: (start: number, end: number) => void;
};

export function DaySchedule({
  name,
  currentDay,
  startTime,
  endTime,
  timezone,
  previousDayIndex,
  nextDayIndex,
  tracks,
  sessions,
  onAddSession,
  onUpdateSession,
  onChangeDisplayTime,
}: Props) {
  const { isFullscreen } = useScheduleFullscreen();

  const zoomHandlers = useZoomHandlers();

  const [openSession, setOpenSession] = useState<Session | null>(null);
  const onCloseSession = () => setOpenSession(null);

  return (
    <main className={cx({ 'px-8 my-8 mx-auto max-w-7xl': !isFullscreen })}>
      <div className={cx({ 'border border-gray-200 rounded-t-lg': !isFullscreen })}>
        <SessionModal session={openSession} tracks={tracks} onClose={onCloseSession} />

        <ScheduleHeader
          currentDay={currentDay}
          startTime={startTime}
          endTime={endTime}
          previousDayIndex={previousDayIndex}
          nextDayIndex={nextDayIndex}
          zoomHandlers={zoomHandlers}
          onChangeDisplayTime={onChangeDisplayTime}
        />

        <Schedule
          day={currentDay}
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
      </div>
    </main>
  );
}
