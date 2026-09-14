import { type ReactNode, useLayoutEffect, useMemo, useState } from 'react';
import { useFetchers } from 'react-router';
import type { ScheduleData } from '../components/schedule.types.ts';
import { SessionModal } from '../components/session/session-modal.tsx';
import { ScheduleTime } from '../models/schedule-time.ts';
import { pendingSessions } from '../models/session-mutation.ts';
import { GestureStore, GestureStoreProvider } from '../store/gesture-store.ts';
import { type ScheduleSettings, ScheduleStore, ScheduleStoreProvider } from '../store/schedule-store.ts';
import { type EditedSession, type ScheduleContextValue, ScheduleContextProvider } from './schedule-context.tsx';
import { useDisplaySettings } from './use-display-settings.tsx';
import { useSessionMutations } from './use-session-mutations.ts';

// The state root of the Schedule. The router stays the source of truth: this provider derives, on every render,
// the Sessions the organizer sees (the loader data with the mutations still in flight applied) and the display
// settings, and pushes them into the schedule store in a layout effect, before the browser paints. It re-renders
// on every fetcher change, which is cheap: its children are memoized and read the store, not this render.

type ScheduleProviderProps = { schedule: ScheduleData; children: ReactNode };

export function ScheduleProvider({ schedule, children }: ScheduleProviderProps) {
  const scheduleTime = useMemo(() => new ScheduleTime(schedule.timezone), [schedule.timezone]);
  const display = useDisplaySettings(schedule, scheduleTime);
  const fetchers = useFetchers();

  const sessions = pendingSessions(schedule.sessions, fetchers, scheduleTime);
  const settings: ScheduleSettings = {
    tracks: schedule.tracks,
    scheduleDays: display.scheduleDays,
    displayedDays: display.displayedDays,
    displayedTimes: display.displayedTimes,
  };

  // Built from the loader data with no mutation in flight, on the server and on the client alike, so the first
  // client snapshot is what the server rendered.
  const [stores] = useState(() => ({
    schedule: new ScheduleStore({ sessions, settings }),
    gesture: new GestureStore(),
  }));

  useLayoutEffect(() => {
    stores.schedule.replace({ sessions, settings });
  });

  const [editedSession, setEditedSession] = useState<EditedSession | null>(null);
  const mutations = useSessionMutations(stores.schedule, scheduleTime);

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

          {editedSession && (
            <SessionModal
              mode={editedSession.mode}
              session={editedSession.session}
              onClose={() => setEditedSession(null)}
            />
          )}
        </ScheduleContextProvider>
      </GestureStoreProvider>
    </ScheduleStoreProvider>
  );
}
