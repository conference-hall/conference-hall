import { createContext, type ReactNode, useContext } from 'react';
import type { ScheduleSession, Track } from '../components/schedule.types.ts';
import type { ScheduleTime } from '../models/schedule-time.ts';
import type { PlacementOutcome, SwapOutcome } from '../models/session-placement.ts';

// CurrentSchedule context: what any descendant needs to know about the Schedule it is in.
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
  onOpenSession: (session: { mode: 'create' | 'edit'; session: ScheduleSession }) => void;
  onChangeDisplayDays: (startIndex: number, endIndex: number) => void;
  onChangeDisplayTimes: (start: number, end: number) => void;
};

type CurrentScheduleProviderProps = { children: ReactNode; value: CurrentSchedule };

const ScheduleContext = createContext<CurrentSchedule | undefined>(undefined);

export const CurrentScheduleProvider = ({ children, value }: CurrentScheduleProviderProps) => {
  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
};

export function useCurrentSchedule(): CurrentSchedule {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useCurrentSchedule must be used within a CurrentScheduleProvider');
  }
  return context;
}

// ScheduleSessions context: The Sessions drawn now, pending mutations applied.
type ScheduleSessionsProviderProps = { children: ReactNode; value: Array<ScheduleSession> };

const ScheduleSessionsContext = createContext<Array<ScheduleSession> | undefined>(undefined);

export const ScheduleSessionsProvider = ({ children, value }: ScheduleSessionsProviderProps) => {
  return <ScheduleSessionsContext.Provider value={value}>{children}</ScheduleSessionsContext.Provider>;
};

export function useScheduleSessions(): Array<ScheduleSession> {
  const context = useContext(ScheduleSessionsContext);
  if (context === undefined) {
    throw new Error('useScheduleSessions must be used within a ScheduleSessionsProvider');
  }
  return context;
}
