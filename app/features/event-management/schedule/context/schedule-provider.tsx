import { type ReactNode, useMemo, useState } from 'react';
import { useStableValue } from '~/shared/utils/use-stable-value.ts';
import type { ScheduleData, ScheduleSession } from '../components/schedule.types.ts';
import { SessionModal } from '../components/session/session-modal.tsx';
import { ScheduleTime } from '../models/schedule-time.ts';
import { type CurrentSchedule, CurrentScheduleProvider, ScheduleSessionsProvider } from './schedule-context.tsx';
import { useDisplaySettings } from './use-display-settings.tsx';
import { useSessions } from './use-sessions.ts';

type EditedSession = { mode: 'create' | 'edit'; session: ScheduleSession };

type ScheduleProviderProps = { schedule: ScheduleData; children: ReactNode };

export function ScheduleProvider({ schedule, children }: ScheduleProviderProps) {
  const scheduleTime = useMemo(() => new ScheduleTime(schedule.timezone), [schedule.timezone]);
  const tracks = useStableValue(schedule.tracks);
  const sessions = useSessions(schedule.sessions, scheduleTime);
  const settings = useDisplaySettings(schedule, scheduleTime);

  const [editedSession, setEditedSession] = useState<EditedSession | null>(null);

  const currentSchedule = useMemo<CurrentSchedule>(
    () => ({
      scheduleTime,
      tracks,
      scheduleDays: settings.scheduleDays,
      displayedDays: settings.displayedDays,
      displayedTimes: settings.displayedTimes,
      addSession: sessions.add,
      updateSession: sessions.update,
      moveSession: sessions.move,
      resizeSession: sessions.resize,
      swapSessions: sessions.swap,
      deleteSession: sessions.delete,
      onOpenSession: setEditedSession,
      onChangeDisplayDays: settings.updateDisplayDays,
      onChangeDisplayTimes: settings.updateDisplayTimes,
    }),
    [
      scheduleTime,
      tracks,
      settings.scheduleDays,
      settings.displayedDays,
      settings.displayedTimes,
      settings.updateDisplayDays,
      settings.updateDisplayTimes,
      sessions.add,
      sessions.update,
      sessions.move,
      sessions.resize,
      sessions.swap,
      sessions.delete,
      setEditedSession,
    ],
  );

  return (
    <CurrentScheduleProvider value={currentSchedule}>
      <ScheduleSessionsProvider value={sessions.data}>
        {children}

        {editedSession && (
          <SessionModal
            mode={editedSession.mode}
            session={editedSession.session}
            onClose={() => setEditedSession(null)}
          />
        )}
      </ScheduleSessionsProvider>
    </CurrentScheduleProvider>
  );
}
