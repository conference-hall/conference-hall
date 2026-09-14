import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { setMinutesFromStartOfDay } from '~/shared/datetimes/datetimes.ts';
import { useStableValue } from '~/shared/utils/use-stable-value.ts';
import type { ScheduleData, ScheduleSession } from './components/schedule.types.ts';
import { SessionModal } from './components/session/session-modal.tsx';
import { useDisplaySettings } from './components/use-display-settings.tsx';
import { useSessions } from './components/use-sessions.ts';
import { ScheduleTime } from './models/schedule-time.ts';
import { SessionMutations } from './models/session-mutation.ts';
import { type CurrentSchedule, CurrentScheduleProvider, ScheduleSessionsProvider } from './schedule-context.tsx';

const NEW_SESSION_DURATION = 30; // minutes

type EditedSession = { mode: 'create' | 'edit'; session: ScheduleSession };

type ScheduleProviderProps = { schedule: ScheduleData; children: ReactNode };

// The stateful provider of the Schedule: composes the state hooks, publishes the two contexts (the stable seam
// and the drawn Sessions) and renders the Session modal next to its children.
export function ScheduleProvider({ schedule, children }: ScheduleProviderProps) {
  const scheduleTime = useMemo(() => new ScheduleTime(schedule.timezone), [schedule.timezone]);
  // The loader is revalidated on every Session mutation: the tracks keep their reference unless they change.
  const tracks = useStableValue(schedule.tracks);
  const sessions = useSessions(schedule.sessions, scheduleTime);
  const settings = useDisplaySettings(schedule, scheduleTime);

  // Local state, never in a context: opening the modal would re-render every reader of the seam.
  const [editedSession, setEditedSession] = useState<EditedSession | null>(null);

  const openSession = useCallback((session: ScheduleSession) => setEditedSession({ mode: 'edit', session }), []);

  const { displayedDays, displayedTimes } = settings;
  const openNewSession = useCallback(() => {
    const day = displayedDays.at(0);
    const trackId = tracks.at(0)?.id;
    if (!day || !trackId) return;

    const { start, end } = displayedTimes;
    setEditedSession({
      mode: 'create',
      session: SessionMutations.blank({
        trackId,
        timeslot: {
          start: setMinutesFromStartOfDay(day, start),
          end: setMinutesFromStartOfDay(day, Math.min(start + NEW_SESSION_DURATION, end)),
        },
      }),
    });
  }, [displayedDays, displayedTimes, tracks]);

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
      onOpenSession: openSession,
      onOpenNewSession: openNewSession,
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
      openSession,
      openNewSession,
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
