import { type ReactNode, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useFetchers, useSubmit } from 'react-router';
import type { ScheduleData } from '../components/schedule.types.ts';
import { SessionModal } from '../components/session/session-modal.tsx';
import { ScheduleTime } from '../models/schedule-time.ts';
import { pendingSessions } from '../models/session-mutation.ts';
import { GestureStore, GestureStoreProvider } from '../store/gesture-store.ts';
import { ScheduleStore, ScheduleStoreProvider } from '../store/schedule-store.ts';
import { type EditedSession, type ScheduleContextValue, ScheduleContextProvider } from './schedule-context.tsx';
import { useDisplaySettings } from './use-display-settings.tsx';
import { useSessionMutations } from './use-session-mutations.ts';

type ScheduleProviderProps = { schedule: ScheduleData; children: ReactNode };

export function ScheduleProvider({ schedule, children }: ScheduleProviderProps) {
  const scheduleTime = useMemo(() => new ScheduleTime(schedule.timezone), [schedule.timezone]);
  const display = useDisplaySettings(schedule, scheduleTime);
  const fetchers = useFetchers();
  const submit = useSubmit();

  const sessions = pendingSessions(schedule.sessions, fetchers, scheduleTime);

  const settings = {
    tracks: schedule.tracks,
    scheduleDays: display.scheduleDays,
    displayedDays: display.displayedDays,
    displayedTimes: display.displayedTimes,
  };

  const [stores] = useState(() => ({
    schedule: new ScheduleStore({ sessions, settings }),
    gesture: new GestureStore(),
  }));

  // Replace only changed sessions and settings.
  useLayoutEffect(() => {
    stores.schedule.replace({ sessions, settings });
  });

  const [editedSession, setEditedSession] = useState<EditedSession | null>(null);
  const closeSession = useCallback(() => setEditedSession(null), []);
  const mutations = useSessionMutations(stores.schedule, scheduleTime, submit);

  const sessionModal = useMemo(() => {
    if (!editedSession) return null;
    return <SessionModal mode={editedSession.mode} session={editedSession.session} onClose={closeSession} />;
  }, [editedSession, closeSession]);

  const { updateDisplayDays, updateDisplayTimes } = display;
  const context = useMemo<ScheduleContextValue>(
    () => ({
      scheduleTime,
      addSession: mutations.add,
      updateSession: mutations.update,
      moveSession: mutations.move,
      resizeSession: mutations.resize,
      swapSessions: mutations.swap,
      deleteSession: mutations.delete,
      onOpenSession: setEditedSession,
      onChangeDisplayDays: updateDisplayDays,
      onChangeDisplayTimes: updateDisplayTimes,
    }),
    [scheduleTime, mutations, updateDisplayDays, updateDisplayTimes],
  );

  return (
    <ScheduleStoreProvider value={stores.schedule}>
      <GestureStoreProvider value={stores.gesture}>
        <ScheduleContextProvider value={context}>
          {children}
          {sessionModal}
        </ScheduleContextProvider>
      </GestureStoreProvider>
    </ScheduleStoreProvider>
  );
}
