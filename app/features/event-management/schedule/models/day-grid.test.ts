import type { ScheduleSession, Track } from '../components/schedule.types.ts';
import {
  blockOf,
  dateOfSlot,
  dayKeyOf,
  draftWindowEnd,
  makeDayGrid,
  resizeWindowEnd,
  sessionAt,
  SLOT_HEIGHTS,
  slotAtY,
  slotHeight,
  slotOfDate,
} from './day-grid.ts';
import { ScheduleTime } from './schedule-time.ts';

// The Schedule is in Tokyo, the test process in UTC: every date below is a Schedule time, never a UTC one.
const scheduleTime = new ScheduleTime('Asia/Tokyo');

// 2025-11-20 at midnight, Schedule time.
const MIDNIGHT_UTC = Date.parse('2025-11-19T15:00:00.000Z');
const day = scheduleTime.fromUtc(new Date(MIDNIGHT_UTC));

const at = (hours: number, minutes = 0) =>
  scheduleTime.fromUtc(new Date(MIDNIGHT_UTC + (hours * 60 + minutes) * 60_000));

const tracks: Array<Track> = [
  { id: 'track-1', name: 'Track 1' },
  { id: 'track-2', name: 'Track 2' },
];

const session = (id: string, trackId: string, start: Date, end: Date): ScheduleSession => ({
  id,
  trackId,
  timeslot: { start, end },
  color: 'stone',
  emojis: [],
  language: null,
});

// 08:00 to 22:00, the widest window an organizer picks: 15 hour rows, the last one starting at 22:00.
const grid = makeDayGrid(day, 0, { start: 8 * 60, end: 22 * 60 }, tracks);

describe('DayGrid', () => {
  describe('makeDayGrid', () => {
    it('counts the slots of the displayed window plus the hour row starting at its end', () => {
      expect(grid.slotCount).toBe(180);
      expect(grid.hourCount).toBe(15);
    });

    it('keys the day by its midnight in Schedule time', () => {
      expect(grid.dayKey).toBe(dayKeyOf(day));
      expect(grid.dayKey).toBe(day.getTime());
    });
  });

  describe('dateOfSlot and slotOfDate', () => {
    it('round trips a slot through its Schedule time', () => {
      for (const slot of [0, 1, 12, 179]) {
        expect(slotOfDate(grid, dateOfSlot(grid, slot))).toBe(slot);
      }
    });

    it('starts at the displayed start time and advances five minutes per slot', () => {
      expect(dateOfSlot(grid, 0).getTime()).toBe(at(8).getTime());
      expect(dateOfSlot(grid, 1).getTime()).toBe(at(8, 5).getTime());
      expect(dateOfSlot(grid, 180).getTime()).toBe(at(23).getTime());
    });

    it('gives a negative slot to a time before the displayed window', () => {
      expect(slotOfDate(grid, at(7))).toBe(-12);
    });
  });

  describe('slotAtY', () => {
    it('divides the column height by its slot count, whatever the zoom level', () => {
      const column = { top: 100, height: 180 * 16 };
      expect(slotAtY(grid, column, 100)).toBe(0);
      expect(slotAtY(grid, column, 115)).toBe(0);
      expect(slotAtY(grid, column, 116)).toBe(1);
      expect(slotAtY(grid, column, 100 + 12 * 16)).toBe(12);
    });

    it('clamps above the first slot and below the last one', () => {
      const column = { top: 100, height: 180 * 16 };
      expect(slotAtY(grid, column, -500)).toBe(0);
      expect(slotAtY(grid, column, 100_000)).toBe(179);
    });
  });

  describe('blockOf', () => {
    it('spans the slots of a Session inside the displayed window', () => {
      expect(blockOf(grid, session('s1', 'track-1', at(9), at(10)))).toEqual({ slot: 12, span: 12 });
    });

    it('truncates a Session ending past the displayed window', () => {
      expect(blockOf(grid, session('s1', 'track-1', at(22, 30), at(23, 30)))).toEqual({ slot: 174, span: 6 });
    });

    it('gives no block to a Session starting before the displayed window', () => {
      expect(blockOf(grid, session('s1', 'track-1', at(7), at(8, 30)))).toBeNull();
    });

    it('gives no block to a Session starting after the displayed window', () => {
      expect(blockOf(grid, session('s1', 'track-1', at(23), at(23, 30)))).toBeNull();
    });

    it('gives at least one slot to a Session shorter than a slot', () => {
      expect(blockOf(grid, session('s1', 'track-1', at(9), at(9, 2)))).toEqual({ slot: 12, span: 1 });
    });
  });

  describe('sessionAt', () => {
    const sessions = [session('s1', 'track-1', at(9), at(10)), session('s2', 'track-2', at(9), at(10))];

    it('finds the Session of the Track covering a Schedule time', () => {
      expect(sessionAt(sessions, 'track-1', at(9, 30))?.id).toBe('s1');
      expect(sessionAt(sessions, 'track-1', at(9))?.id).toBe('s1');
    });

    it('does not find a Session on its end time nor on another Track', () => {
      expect(sessionAt(sessions, 'track-1', at(10))).toBeUndefined();
      expect(sessionAt(sessions, 'track-3', at(9, 30))).toBeUndefined();
    });
  });

  describe('draftWindowEnd', () => {
    it('extends to the end of the displayed day when the Track has no next Session', () => {
      expect(draftWindowEnd(grid, [], 'track-1', 12)).toBe(180);
    });

    it('extends to the next Session of the Track', () => {
      const sessions = [session('s1', 'track-1', at(10), at(11))];
      expect(draftWindowEnd(grid, sessions, 'track-1', 12)).toBe(24);
    });

    it('ignores the Sessions of the other Tracks', () => {
      const sessions = [session('s1', 'track-2', at(10), at(11))];
      expect(draftWindowEnd(grid, sessions, 'track-1', 12)).toBe(180);
    });

    it('gives one slot when the start slot is already covered', () => {
      const sessions = [session('s1', 'track-1', at(9), at(10))];
      expect(draftWindowEnd(grid, sessions, 'track-1', 12)).toBe(13);
    });
  });

  describe('resizeWindowEnd', () => {
    it('ignores the Session being resized and stops at the next one', () => {
      const resized = session('s1', 'track-1', at(9), at(10));
      const next = session('s2', 'track-1', at(11), at(12));
      expect(resizeWindowEnd(grid, [resized, next], resized, 12)).toBe(36);
    });

    it('extends to the end of the displayed day without a next Session', () => {
      const resized = session('s1', 'track-1', at(9), at(10));
      expect(resizeWindowEnd(grid, [resized], resized, 12)).toBe(180);
    });
  });

  describe('slotHeight', () => {
    it('gives the pixel height of a slot per zoom level, and falls back to the smallest one', () => {
      expect(SLOT_HEIGHTS.map((_, level) => slotHeight(level))).toEqual(SLOT_HEIGHTS);
      expect(slotHeight(42)).toBe(SLOT_HEIGHTS[0]);
    });
  });
});
