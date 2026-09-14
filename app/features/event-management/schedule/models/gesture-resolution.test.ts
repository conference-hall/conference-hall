import type { ScheduleSession, Track } from '../components/schedule.types.ts';
import { makeDayGrid, resizeWindowEnd } from './day-grid.ts';
import { resolveMove, resolveResize } from './gesture-resolution.ts';
import { ScheduleTime } from './schedule-time.ts';

const scheduleTime = new ScheduleTime('Asia/Tokyo');

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

const grid = makeDayGrid(day, 0, { start: 8 * 60, end: 22 * 60 }, tracks);
const columnRect = { top: 0, height: 180 * 16 };
const yOfSlot = (slot: number) => slot * 16;

const dragged = session('dragged', 'track-1', at(9), at(10));

describe('resolveMove', () => {
  it('moves the Session to the slot under its top edge, in the column it is over', () => {
    const gesture = resolveMove({
      session: dragged,
      column: { dayKey: grid.dayKey, trackId: 'track-2' },
      columnRect,
      grid,
      draggedTop: yOfSlot(24),
      sessions: [dragged],
    });

    expect(gesture).toEqual({
      kind: 'move',
      sessionId: 'dragged',
      dayKey: grid.dayKey,
      trackId: 'track-2',
      slot: 24,
    });
  });

  it('gives no target when the dragged block is over no column', () => {
    const gesture = resolveMove({
      session: dragged,
      column: null,
      columnRect: null,
      grid,
      draggedTop: yOfSlot(24),
      sessions: [dragged],
    });

    expect(gesture).toBeNull();
  });

  it('clamps the slot above the first one and below the last one', () => {
    const above = resolveMove({
      session: dragged,
      column: { dayKey: grid.dayKey, trackId: 'track-2' },
      columnRect,
      grid,
      draggedTop: -800,
      sessions: [dragged],
    });
    const below = resolveMove({
      session: dragged,
      column: { dayKey: grid.dayKey, trackId: 'track-2' },
      columnRect,
      grid,
      draggedTop: 99_999,
      sessions: [dragged],
    });

    expect(above).toMatchObject({ kind: 'move', slot: 0 });
    expect(below).toMatchObject({ kind: 'move', slot: 179 });
  });

  it('swaps when the slot under the top edge is covered by another Session, on that Session block', () => {
    const target = session('target', 'track-2', at(14), at(15));
    const gesture = resolveMove({
      session: dragged,
      column: { dayKey: grid.dayKey, trackId: 'track-2' },
      columnRect,
      grid,
      draggedTop: yOfSlot(78),
      sessions: [dragged, target],
    });

    expect(gesture).toEqual({
      kind: 'swap',
      sessionId: 'dragged',
      targetSessionId: 'target',
      dayKey: grid.dayKey,
      trackId: 'track-2',
      slot: 72,
      span: 12,
    });
  });

  it('moves rather than swaps over its own slots', () => {
    const gesture = resolveMove({
      session: dragged,
      column: { dayKey: grid.dayKey, trackId: 'track-1' },
      columnRect,
      grid,
      draggedTop: yOfSlot(13),
      sessions: [dragged],
    });

    expect(gesture).toMatchObject({ kind: 'move', slot: 13 });
  });

  it('gives no target on a slot covered by a Session the day does not draw', () => {
    const invisible = session('invisible', 'track-2', at(7), at(9));
    const gesture = resolveMove({
      session: dragged,
      column: { dayKey: grid.dayKey, trackId: 'track-2' },
      columnRect,
      grid,
      draggedTop: yOfSlot(6),
      sessions: [dragged, invisible],
    });

    expect(gesture).toBeNull();
  });
});

describe('resolveResize', () => {
  const windowEnd = 180;

  it('ends the Session on the slot under the handle', () => {
    const gesture = resolveResize({
      session: dragged,
      columnRect,
      grid,
      draggedTop: yOfSlot(30),
      windowEnd,
    });

    expect(gesture).toEqual({
      kind: 'resize',
      sessionId: 'dragged',
      dayKey: grid.dayKey,
      trackId: 'track-1',
      slot: 12,
      endSlot: 31,
    });
  });

  it('keeps one slot when the handle is dragged above the start of the Session', () => {
    const gesture = resolveResize({ session: dragged, columnRect, grid, draggedTop: -500, windowEnd });

    expect(gesture).toMatchObject({ slot: 12, endSlot: 13 });
  });

  it('clamps to the extension window when the handle passes over the next Session', () => {
    const next = session('next', 'track-1', at(11), at(12));
    const end = resizeWindowEnd(grid, [dragged, next], dragged, 12);
    const gesture = resolveResize({ session: dragged, columnRect, grid, draggedTop: yOfSlot(60), windowEnd: end });

    expect(end).toBe(36);
    expect(gesture).toMatchObject({ slot: 12, endSlot: 36 });
  });

  it('gives no target when the Session has no block in the displayed day', () => {
    const invisible = session('invisible', 'track-1', at(7), at(9));
    const gesture = resolveResize({ session: invisible, columnRect, grid, draggedTop: yOfSlot(30), windowEnd });

    expect(gesture).toBeNull();
  });
});
