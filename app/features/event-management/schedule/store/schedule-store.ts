import { createContext, useContext, useSyncExternalStore } from 'react';
import { deepEqual } from '~/shared/utils/deep-equal.ts';
import type { ScheduleSession, Track } from '../components/schedule.types.ts';
import { dayKeyOf } from '../models/day-grid.ts';

// The projection of the Schedule the client draws. The router stays the source of truth: the provider pushes the
// Sessions it derives from the loader data and the in-flight mutations into `replace` after every render, and the
// store diffs them by content so that an untouched Session, an untouched (day, Track) column and untouched
// settings keep their reference. Readers subscribe to the slice they draw, so a mutation re-renders only the
// Sessions it touches and the columns whose content changed. The store holds nothing the router does not know.

type Listener = () => void;

export type ScheduleSettings = {
  tracks: Array<Track>;
  scheduleDays: Array<Date>;
  displayedDays: Array<Date>;
  displayedTimes: { start: number; end: number };
};

export type ScheduleSnapshot = { sessions: Array<ScheduleSession>; settings: ScheduleSettings };

const EMPTY_COLUMN: Array<string> = [];

export class ScheduleStore {
  private byId = new Map<string, ScheduleSession>();
  private all: Array<ScheduleSession> = [];
  private columns = new Map<string, Array<string>>();
  private settings: ScheduleSettings;
  private listeners = new Set<Listener>();

  constructor(initial: ScheduleSnapshot) {
    this.settings = initial.settings;
    this.replaceSessions(initial.sessions);
  }

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  // One getter per slice, used as the client snapshot and as the server snapshot alike: the stored reference.
  getSession = (id: string): ScheduleSession | undefined => this.byId.get(id);

  getAll = (): Array<ScheduleSession> => this.all;

  getColumnIds = (dayKey: number, trackId: string): Array<string> =>
    this.columns.get(columnKey(dayKey, trackId)) ?? EMPTY_COLUMN;

  getSettings = (): ScheduleSettings => this.settings;

  // Projects a new state of the router. Notifies only when something the readers draw actually changed.
  replace({ sessions, settings }: ScheduleSnapshot): void {
    const sessionsChanged = this.replaceSessions(sessions);
    const settingsChanged = !deepEqual(this.settings, settings);
    if (settingsChanged) this.settings = settings;

    if (!sessionsChanged && !settingsChanged) return;
    for (const listener of this.listeners) listener();
  }

  // Keeps the previous object of every Session equal by content, so an untouched Session never re-renders.
  private replaceSessions(sessions: Array<ScheduleSession>): boolean {
    const next = new Map<string, ScheduleSession>();
    let changed = sessions.length !== this.byId.size;

    for (const session of sessions) {
      const previous = this.byId.get(session.id);
      if (previous && deepEqual(previous, session)) {
        next.set(session.id, previous);
      } else {
        next.set(session.id, session);
        changed = true;
      }
    }

    if (!changed) return false;

    this.byId = next;
    this.all = Array.from(next.values());
    this.rebuildColumns();
    return true;
  }

  // Recomputes the ids of every (day, Track) column, keeping the previous array when its content is unchanged.
  private rebuildColumns(): void {
    const next = new Map<string, Array<string>>();
    const sorted = this.all.toSorted((a, b) => a.timeslot.start.getTime() - b.timeslot.start.getTime());

    for (const session of sorted) {
      const key = columnKey(dayKeyOf(session.timeslot.start), session.trackId);
      const ids = next.get(key) ?? [];
      ids.push(session.id);
      next.set(key, ids);
    }

    for (const [key, ids] of next) {
      const previous = this.columns.get(key);
      if (previous && previous.length === ids.length && previous.every((id, index) => id === ids[index])) {
        next.set(key, previous);
      }
    }

    this.columns = next;
  }
}

function columnKey(dayKey: number, trackId: string): string {
  return `${dayKey}:${trackId}`;
}

const ScheduleStoreContext = createContext<ScheduleStore | null>(null);

export const ScheduleStoreProvider = ScheduleStoreContext.Provider;

export function useScheduleStore(): ScheduleStore {
  const store = useContext(ScheduleStoreContext);
  if (!store) throw new Error('useScheduleStore must be used within a ScheduleStoreProvider');
  return store;
}

export function useSession(id: string): ScheduleSession | undefined {
  const store = useScheduleStore();
  const snapshot = () => store.getSession(id);
  return useSyncExternalStore(store.subscribe, snapshot, snapshot);
}

export function useColumnIds(dayKey: number, trackId: string): Array<string> {
  const store = useScheduleStore();
  const snapshot = () => store.getColumnIds(dayKey, trackId);
  return useSyncExternalStore(store.subscribe, snapshot, snapshot);
}

export function useSettings(): ScheduleSettings {
  const store = useScheduleStore();
  return useSyncExternalStore(store.subscribe, store.getSettings, store.getSettings);
}
