import { startOfDay } from 'date-fns';
import type { ScheduleSession } from '../components/schedule.types.ts';
import { type ScheduleSettings, ScheduleStore } from './schedule-store.ts';

const at = (day: 20 | 21, hours: number, minutes = 0) =>
  new Date(`2025-11-${day}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`);

const dayKey = (day: 20 | 21) => startOfDay(at(day, 0)).getTime();

const session = (id: string, trackId: string, start: Date, end: Date): ScheduleSession => ({
  id,
  trackId,
  timeslot: { start, end },
  name: null,
  color: 'stone',
  emojis: [],
  language: null,
  proposal: null,
});

const settings = (): ScheduleSettings => ({
  tracks: [
    { id: 'track-1', name: 'Track 1' },
    { id: 'track-2', name: 'Track 2' },
  ],
  scheduleDays: [at(20, 0), at(21, 0)],
  displayedDays: [at(20, 0)],
  displayedTimes: { start: 9 * 60, end: 18 * 60 },
});

const first = () => session('s1', 'track-1', at(20, 9), at(20, 10));
const second = () => session('s2', 'track-2', at(20, 9), at(20, 10));
const nextDay = () => session('s3', 'track-1', at(21, 9), at(21, 10));

const store = (sessions = [first(), second(), nextDay()]) => new ScheduleStore({ sessions, settings: settings() });

describe('ScheduleStore', () => {
  describe('#replace', () => {
    it('keeps the reference of a Session, of a column and of the settings equal by content', () => {
      const scheduleStore = new ScheduleStore({ sessions: [first(), second()], settings: settings() });
      const session1 = scheduleStore.getSession('s1');
      const column1 = scheduleStore.getColumnIds(dayKey(20), 'track-1');
      const previousSettings = scheduleStore.getSettings();

      scheduleStore.replace({ sessions: [first(), second()], settings: settings() });

      expect(scheduleStore.getSession('s1')).toBe(session1);
      expect(scheduleStore.getColumnIds(dayKey(20), 'track-1')).toBe(column1);
      expect(scheduleStore.getSettings()).toBe(previousSettings);
    });

    it('changes only the Session it touches and only its column', () => {
      const scheduleStore = new ScheduleStore({ sessions: [first(), second()], settings: settings() });
      const session2 = scheduleStore.getSession('s2');
      const column2 = scheduleStore.getColumnIds(dayKey(20), 'track-2');

      const resized = { ...first(), timeslot: { start: at(20, 9), end: at(20, 11) } };
      scheduleStore.replace({ sessions: [resized, second()], settings: settings() });

      expect(scheduleStore.getSession('s1')).toEqual(resized);
      expect(scheduleStore.getSession('s2')).toBe(session2);
      expect(scheduleStore.getColumnIds(dayKey(20), 'track-2')).toBe(column2);
    });

    it('changes both columns when a Session moves from one to the other', () => {
      const scheduleStore = new ScheduleStore({ sessions: [first()], settings: settings() });
      const source = scheduleStore.getColumnIds(dayKey(20), 'track-1');
      const target = scheduleStore.getColumnIds(dayKey(20), 'track-2');

      scheduleStore.replace({ sessions: [{ ...first(), trackId: 'track-2' }], settings: settings() });

      expect(scheduleStore.getColumnIds(dayKey(20), 'track-1')).not.toBe(source);
      expect(scheduleStore.getColumnIds(dayKey(20), 'track-1')).toEqual([]);
      expect(scheduleStore.getColumnIds(dayKey(20), 'track-2')).not.toBe(target);
      expect(scheduleStore.getColumnIds(dayKey(20), 'track-2')).toEqual(['s1']);
    });

    it('indexes the columns by day and orders them by start time', () => {
      const early = session('early', 'track-1', at(20, 8), at(20, 9));
      const scheduleStore = new ScheduleStore({ sessions: [first(), nextDay(), early], settings: settings() });

      expect(scheduleStore.getColumnIds(dayKey(20), 'track-1')).toEqual(['early', 's1']);
      expect(scheduleStore.getColumnIds(dayKey(21), 'track-1')).toEqual(['s3']);
    });

    it('drops a Session removed from the projection', () => {
      const scheduleStore = new ScheduleStore({ sessions: [first(), second()], settings: settings() });

      scheduleStore.replace({ sessions: [second()], settings: settings() });

      expect(scheduleStore.getSession('s1')).toBeUndefined();
      expect(scheduleStore.getAll()).toHaveLength(1);
      expect(scheduleStore.getColumnIds(dayKey(20), 'track-1')).toEqual([]);
    });

    it('notifies the listeners only when something changed', () => {
      const scheduleStore = new ScheduleStore({ sessions: [first()], settings: settings() });
      const listener = vi.fn();
      scheduleStore.subscribe(listener);

      scheduleStore.replace({ sessions: [first()], settings: settings() });
      expect(listener).not.toHaveBeenCalled();

      scheduleStore.replace({ sessions: [first(), second()], settings: settings() });
      expect(listener).toHaveBeenCalledTimes(1);

      scheduleStore.replace({
        sessions: [first(), second()],
        settings: { ...settings(), displayedTimes: { start: 8 * 60, end: 18 * 60 } },
      });
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('stops notifying an unsubscribed listener', () => {
      const scheduleStore = new ScheduleStore({ sessions: [first()], settings: settings() });
      const listener = vi.fn();
      const unsubscribe = scheduleStore.subscribe(listener);

      unsubscribe();
      scheduleStore.replace({ sessions: [], settings: settings() });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  it('exposes the same stable reference per slice on two calls, as the server and the client snapshots need', () => {
    const scheduleStore = store();

    expect(scheduleStore.getSession('s1')).toBe(scheduleStore.getSession('s1'));
    expect(scheduleStore.getAll()).toBe(scheduleStore.getAll());
    expect(scheduleStore.getColumnIds(dayKey(20), 'track-1')).toBe(scheduleStore.getColumnIds(dayKey(20), 'track-1'));
    expect(scheduleStore.getSettings()).toBe(scheduleStore.getSettings());
    expect(scheduleStore.getColumnIds(dayKey(20), 'unknown')).toBe(scheduleStore.getColumnIds(dayKey(21), 'unknown'));
  });
});
