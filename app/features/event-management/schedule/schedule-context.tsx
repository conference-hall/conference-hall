import { createContext, type ReactNode, useContext } from 'react';
import type { ScheduleSession, Track } from './components/schedule.types.ts';
import type { ScheduleTime } from './models/schedule-time.ts';
import type { PlacementOutcome, SwapOutcome } from './models/session-placement.ts';

// The seam of the Schedule: what any descendant needs to know about the Schedule it is in.
// Its value only changes when the Schedule changes (timezone, tracks, days, displayed times): the drawn Sessions
// never enter it, they have their own context below, read at a single point of the grid.
// Naming: a verb for a Schedule mutation, an `on` prefix for an interface gesture.
export type CurrentSchedule = {
  scheduleTime: ScheduleTime;
  tracks: Array<Track>;
  scheduleDays: Array<Date>;
  displayedDays: Array<Date>;
  displayedTimes: { start: number; end: number };
  addSession: (session: Omit<ScheduleSession, 'id' | 'isCreating'>) => Promise<PlacementOutcome>;
  updateSession: (session: ScheduleSession) => Promise<PlacementOutcome>;
  moveSession: (session: ScheduleSession, target: { trackId: string; start: Date }) => Promise<PlacementOutcome>;
  resizeSession: (session: ScheduleSession, end: Date) => Promise<PlacementOutcome>;
  swapSessions: (source: ScheduleSession, target: ScheduleSession) => Promise<SwapOutcome>;
  deleteSession: (session: ScheduleSession) => Promise<void>;
  onOpenSession: (session: ScheduleSession) => void;
  onOpenNewSession: VoidFunction;
  onChangeDisplayDays: (startIndex: number, endIndex: number) => void;
  onChangeDisplayTimes: (start: number, end: number) => void;
};

type CurrentScheduleProviderProps = { children: ReactNode; value: CurrentSchedule };

const ScheduleContext = createContext<CurrentSchedule | undefined>(undefined);

export const CurrentScheduleProvider = ({ children, value }: CurrentScheduleProviderProps) => {
  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
};

/**
 * Returns the current schedule: its time, tracks, days, displayed times, session mutations and interface gestures.
 * @returns {CurrentSchedule}
 */
export function useCurrentSchedule(): CurrentSchedule {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useCurrentSchedule must be used within a CurrentScheduleProvider');
  }
  return context;
}

// The Sessions drawn now, pending mutations applied: a new list on every pending mutation and server response.
type ScheduleSessionsProviderProps = { children: ReactNode; value: Array<ScheduleSession> };

const ScheduleSessionsContext = createContext<Array<ScheduleSession> | undefined>(undefined);

export const ScheduleSessionsProvider = ({ children, value }: ScheduleSessionsProviderProps) => {
  return <ScheduleSessionsContext.Provider value={value}>{children}</ScheduleSessionsContext.Provider>;
};

/**
 * Returns the sessions drawn in the current schedule, pending mutations applied.
 * @returns {Array<ScheduleSession>}
 */
export function useScheduleSessions(): Array<ScheduleSession> {
  const context = useContext(ScheduleSessionsContext);
  if (context === undefined) {
    throw new Error('useScheduleSessions must be used within a ScheduleSessionsProvider');
  }
  return context;
}
