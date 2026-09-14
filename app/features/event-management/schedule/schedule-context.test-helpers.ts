import { ScheduleTime } from './models/schedule-time.ts';
import type { CurrentSchedule } from './schedule-context.tsx';

const scheduleTime = new ScheduleTime('Europe/Paris');
const day = scheduleTime.fromUtc(new Date('2024-10-05T07:00:00.000Z'));
const placement = { trackId: 'track-1', timeslot: { start: day, end: day } };
const placed = { status: 'placed', placement } as const;
const swapped = { status: 'placed', source: placement, target: placement } as const;

// A complete Schedule seam for tests: override only what the test observes.
export function buildCurrentSchedule(overrides: Partial<CurrentSchedule> = {}): CurrentSchedule {
  return {
    scheduleTime,
    tracks: [{ id: 'track-1', name: 'Room 1' }],
    scheduleDays: [day],
    displayedDays: [day],
    displayedTimes: { start: 9 * 60, end: 18 * 60 },
    addSession: async () => placed,
    updateSession: async () => placed,
    moveSession: async () => placed,
    resizeSession: async () => placed,
    swapSessions: async () => swapped,
    deleteSession: async () => {},
    onOpenSession: () => {},
    onOpenNewSession: () => {},
    onChangeDisplayDays: () => {},
    onChangeDisplayTimes: () => {},
    ...overrides,
  };
}
