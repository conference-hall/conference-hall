import { addMinutes, differenceInMinutes, startOfDay } from 'date-fns';
import type { ScheduleSession, Track } from '../components/schedule.types.ts';
import { SessionPlacement } from './session-placement.ts';

const SLOT_MINUTES = 5;
const HOUR_MINUTES = 60;

export const SLOTS_PER_HOUR = 60 / SLOT_MINUTES;
export const SLOT_HEIGHTS = [4, 8, 16, 20, 24]; // Height of one slot in pixels, by zoom level.

export type DayGrid = {
  dayKey: number; // the key of a day in the stores (the day at midnight as epoch ms)
  dayIndex: number;
  day: Date;
  displayStart: number;
  displayEnd: number;
  slotCount: number;
  hourCount: number;
  tracks: Array<Track>;
};

export type Block = { slot: number; span: number };
export type ColumnRect = { top: number; height: number };

// Resolves the slot height for a given zoom level.
export function slotHeight(zoomLevel: number): number {
  return SLOT_HEIGHTS[zoomLevel] ?? SLOT_HEIGHTS[0];
}

// Resolves the day key of a given date.
export function dayKeyOf(date: Date): number {
  return startOfDay(date).getTime();
}

// Builds a day grid for a given day.
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

// Resolves the date of a given slot on the day grid.
export function dateOfSlot(grid: DayGrid, slot: number): Date {
  return addMinutes(grid.day, grid.displayStart + slot * SLOT_MINUTES);
}

// Resolves the slot of a given date on the day grid.
export function slotOfDate(grid: DayGrid, date: Date): number {
  return Math.floor((differenceInMinutes(date, grid.day) - grid.displayStart) / SLOT_MINUTES);
}

// Resolves the slot at a given Y coordinate on a column.
export function slotAtY(grid: DayGrid, column: ColumnRect, y: number): number {
  const pxPerSlot = column.height / grid.slotCount;
  const slot = Math.floor((y - column.top) / pxPerSlot);
  return Math.max(0, Math.min(grid.slotCount - 1, slot));
}

// Resolves the block of a Session on a day grid, given its start and end times.
export function blockOf(grid: DayGrid, session: ScheduleSession): Block | null {
  const slot = slotOfDate(grid, session.timeslot.start);
  if (slot < 0 || slot >= grid.slotCount) return null;

  const slotIndex = Math.floor(differenceInMinutes(session.timeslot.end, session.timeslot.start) / SLOT_MINUTES);
  const span = Math.max(1, slotIndex);
  return { slot, span: Math.min(span, grid.slotCount - slot) };
}

// Resolves the Session at a given date on a track, if any.
export function sessionAt(sessions: Array<ScheduleSession>, trackId: string, date: Date): ScheduleSession | undefined {
  return sessions.find((s) => s.trackId === trackId && s.timeslot.start <= date && date < s.timeslot.end);
}

// Resolves the extended end slot when resizing a session or draft session.
export function extendedEndSlot(startSlot: number, windowEnd: number, slot: number): number {
  return Math.max(startSlot + 1, Math.min(windowEnd, slot + 1));
}

// Resolves the resize window when resizing a session or draft session.
export function resizeWindowEnd(
  grid: DayGrid,
  sessions: Array<ScheduleSession>,
  sessionId: string,
  trackId: string,
  startSlot: number,
): number {
  const start = dateOfSlot(grid, startSlot);
  const placedSession = { id: sessionId, trackId, timeslot: { start, end: addMinutes(start, SLOT_MINUTES) } };
  const outcome = new SessionPlacement(sessions).resize(placedSession, dateOfSlot(grid, grid.slotCount));
  if (outcome.status === 'conflict') return startSlot + 1;
  return slotOfDate(grid, outcome.placement.timeslot.end);
}
