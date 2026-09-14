import { createContext, type ReactNode, useContext } from 'react';
import type { ScheduleSession, Track } from './components/schedule.types.ts';
import type { ScheduleTime } from './models/schedule-time.ts';
import type { PlacementOutcome } from './models/session-placement.ts';

// The seam of the Schedule: what any descendant needs to know about the Schedule it is in.
export type CurrentSchedule = {
  scheduleTime: ScheduleTime;
  tracks: Array<Track>;
  scheduleDays: Array<Date>;
  displayedDays: Array<Date>;
  displayedTimes: { start: number; end: number };
  addSession: (session: Omit<ScheduleSession, 'id' | 'isCreating'>) => Promise<PlacementOutcome>;
  updateSession: (session: ScheduleSession) => Promise<PlacementOutcome>;
  deleteSession: (session: ScheduleSession) => Promise<void>;
  onOpenSession: (session: ScheduleSession) => void;
};

type CurrentScheduleProviderProps = { children: ReactNode; value: CurrentSchedule };

const ScheduleContext = createContext<CurrentSchedule | undefined>(undefined);

export const CurrentScheduleProvider = ({ children, value }: CurrentScheduleProviderProps) => {
  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
};

/**
 * Returns the current schedule: its time, tracks, days, displayed times, session mutations and session opening.
 * @returns {CurrentSchedule}
 */
export function useCurrentSchedule(): CurrentSchedule {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useCurrentSchedule must be used within a CurrentScheduleProvider');
  }
  return context;
}
