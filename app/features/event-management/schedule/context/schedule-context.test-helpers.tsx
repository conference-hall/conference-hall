import { type ReactNode, useState } from 'react';
import type { ScheduleSession } from '../components/schedule.types.ts';
import { ScheduleTime } from '../models/schedule-time.ts';
import { GestureStore, GestureStoreProvider } from '../store/gesture-store.ts';
import { type ScheduleSettings, ScheduleStore, ScheduleStoreProvider } from '../store/schedule-store.ts';
import { type ScheduleContextValue, ScheduleContextProvider } from './schedule-context.tsx';

const scheduleTime = new ScheduleTime('Europe/Paris');
const day = scheduleTime.fromUtc(new Date('2024-10-05T07:00:00.000Z'));
const placement = { trackId: 'track-1', timeslot: { start: day, end: day } };
const placed = { status: 'placed', placement } as const;
const swapped = { status: 'placed', source: placement, target: placement } as const;

export function buildScheduleSettings(overrides: Partial<ScheduleSettings> = {}): ScheduleSettings {
  return {
    tracks: overrides.tracks ?? [{ id: 'track-1', name: 'Room 1' }],
    scheduleDays: overrides.scheduleDays ?? [day],
    displayedDays: overrides.displayedDays ?? [day],
    displayedTimes: overrides.displayedTimes ?? { start: 9 * 60, end: 18 * 60 },
  };
}

function buildScheduleContext(overrides: Partial<ScheduleContextValue> = {}): ScheduleContextValue {
  return {
    scheduleTime,
    addSession: async () => placed,
    updateSession: async () => placed,
    moveSession: async () => placed,
    resizeSession: async () => placed,
    swapSessions: async () => swapped,
    deleteSession: async () => {},
    onOpenSession: () => {},
    onChangeDisplayDays: () => {},
    onChangeDisplayTimes: () => {},
    ...overrides,
  };
}

type ScheduleProvidersProps = Partial<ScheduleSettings> &
  Partial<ScheduleContextValue> & { children: ReactNode; sessions?: Array<ScheduleSession> };

export function ScheduleProviders({ children, sessions = [], ...overrides }: ScheduleProvidersProps) {
  const { tracks, scheduleDays, displayedDays, displayedTimes, ...actions } = overrides;
  const [stores] = useState(() => ({
    schedule: new ScheduleStore({
      sessions,
      settings: buildScheduleSettings({ tracks, scheduleDays, displayedDays, displayedTimes }),
    }),
    gesture: new GestureStore(),
  }));

  return (
    <ScheduleStoreProvider value={stores.schedule}>
      <GestureStoreProvider value={stores.gesture}>
        <ScheduleContextProvider value={buildScheduleContext(actions)}>{children}</ScheduleContextProvider>
      </GestureStoreProvider>
    </ScheduleStoreProvider>
  );
}
