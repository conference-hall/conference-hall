import { addMinutes, differenceInMinutes, startOfDay } from 'date-fns';
import type { ScheduleSession, Track } from '../components/schedule.types.ts';
import { SessionPlacement } from './session-placement.ts';

// Owns everything one displayed day of the Schedule knows as a grid of 5-minute slots per Track column: how many
// slots and hour rows it shows, the Schedule time of a slot and the slot of a Schedule time, the slot under a
// pixel, where a Session sits, which Session covers a slot, and how far a block may be extended downwards.
// It owns no pixel besides the slot height table and never imports the drag-and-drop library nor the DOM.

export const SLOT_MINUTES = 5;
export const SLOTS_PER_HOUR = 60 / SLOT_MINUTES;

// Height of one slot in pixels, by zoom level. The grid root turns it into the `--slot-height` custom property.
export const SLOT_HEIGHTS = [4, 8, 16, 20, 24];

// Id given to a Session draft while the Placement rule computes its extension window: a draft is not a Session yet.
const DRAFT_SESSION_ID = 'session-draft';

const HOUR_MINUTES = 60;

export type DayGrid = {
  dayKey: number; // the day at midnight (Schedule time) as epoch ms: the key of a day in the stores
  dayIndex: number;
  day: Date;
  displayStart: number; // minutes from midnight
  displayEnd: number;
  slotCount: number;
  hourCount: number;
  tracks: Array<Track>;
};

// Where a Session sits in a day grid: its first slot and how many slots it spans, truncated to the displayed day.
export type Block = { slot: number; span: number };

// The client rectangle of a Track column, the only pixels the model reads. A column spans exactly `slotCount`
// rows, so its height divided by the slot count is the height of one slot, whatever the zoom level.
export type ColumnRect = { top: number; height: number };

export function slotHeight(zoomLevel: number): number {
  return SLOT_HEIGHTS[zoomLevel] ?? SLOT_HEIGHTS[0];
}

export function dayKeyOf(date: Date): number {
  return startOfDay(date).getTime();
}

// A displayed day runs from `displayedTimes.start` to the end of the hour row starting at `displayedTimes.end`.
export function makeDayGrid(
  day: Date,
  dayIndex: number,
  displayedTimes: { start: number; end: number },
  tracks: Array<Track>,
): DayGrid {
  const slotCount = Math.floor((displayedTimes.end + HOUR_MINUTES - displayedTimes.start) / SLOT_MINUTES);
  return {
    dayKey: dayKeyOf(day),
    dayIndex,
    day,
    displayStart: displayedTimes.start,
    displayEnd: displayedTimes.end,
    slotCount,
    hourCount: Math.ceil(slotCount / SLOTS_PER_HOUR),
    tracks,
  };
}

export function dateOfSlot(grid: DayGrid, slot: number): Date {
  return addMinutes(grid.day, grid.displayStart + slot * SLOT_MINUTES);
}

export function slotOfDate(grid: DayGrid, date: Date): number {
  return Math.floor((differenceInMinutes(date, grid.day) - grid.displayStart) / SLOT_MINUTES);
}

// The slot under a viewport `y`, clamped to the displayed day.
export function slotAtY(grid: DayGrid, column: ColumnRect, y: number): number {
  const pxPerSlot = column.height / grid.slotCount;
  const slot = Math.floor((y - column.top) / pxPerSlot);
  return Math.max(0, Math.min(grid.slotCount - 1, slot));
}

// Where a Session sits in a day grid. A Session ending past the displayed day is truncated to its last slot; a
// Session starting outside the displayed day has no block, though it still occupies its slots.
export function blockOf(grid: DayGrid, session: ScheduleSession): Block | null {
  const slot = slotOfDate(grid, session.timeslot.start);
  if (slot < 0 || slot >= grid.slotCount) return null;

  const span = Math.max(
    1,
    Math.floor(differenceInMinutes(session.timeslot.end, session.timeslot.start) / SLOT_MINUTES),
  );
  return { slot, span: Math.min(span, grid.slotCount - slot) };
}

// The Session of a Track covering a Schedule time, if any.
export function sessionAt(sessions: Array<ScheduleSession>, trackId: string, date: Date): ScheduleSession | undefined {
  return sessions.find((s) => s.trackId === trackId && s.timeslot.start <= date && date < s.timeslot.end);
}

// The last slot (exclusive) a Session draft started at `startSlot` may be extended to.
export function draftWindowEnd(
  grid: DayGrid,
  sessions: Array<ScheduleSession>,
  trackId: string,
  startSlot: number,
): number {
  return extensionEnd(grid, sessions, DRAFT_SESSION_ID, trackId, startSlot);
}

// The last slot (exclusive) a Session being resized may be extended to, computed once at the start of the gesture.
export function resizeWindowEnd(
  grid: DayGrid,
  sessions: Array<ScheduleSession>,
  session: ScheduleSession,
  startSlot: number,
): number {
  return extensionEnd(grid, sessions, session.id, session.trackId, startSlot);
}

// How far down a block starting at `startSlot` may grow: up to the next Session of the Track, or the end of the
// displayed day, as the Placement rule decides.
function extensionEnd(
  grid: DayGrid,
  sessions: Array<ScheduleSession>,
  id: string,
  trackId: string,
  startSlot: number,
): number {
  const start = dateOfSlot(grid, startSlot);
  const outcome = new SessionPlacement(sessions).resize(
    { id, trackId, timeslot: { start, end: addMinutes(start, SLOT_MINUTES) } },
    dateOfSlot(grid, grid.slotCount),
  );
  if (outcome.status === 'conflict') return startSlot + 1;
  return slotOfDate(grid, outcome.placement.timeslot.end);
}
