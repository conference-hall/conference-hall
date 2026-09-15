import { createContext, useContext } from 'react';
import type { ScheduleSession } from '../components/schedule.types.ts';
import type { ScheduleTime } from '../models/schedule-time.ts';
import type { PlacementOutcome, SwapOutcome } from '../models/session-placement.ts';

export type EditedSession = { mode: 'create' | 'edit'; session: ScheduleSession };

export type ScheduleContextValue = {
  scheduleTime: ScheduleTime;
  addSession: (session: Omit<ScheduleSession, 'id' | 'isCreating'>) => Promise<PlacementOutcome>;
  updateSession: (session: ScheduleSession) => Promise<PlacementOutcome>;
  moveSession: (session: ScheduleSession, target: { trackId: string; start: Date }) => Promise<PlacementOutcome>;
  resizeSession: (session: ScheduleSession, end: Date) => Promise<PlacementOutcome>;
  swapSessions: (source: ScheduleSession, target: ScheduleSession) => Promise<SwapOutcome>;
  deleteSession: (session: ScheduleSession) => Promise<void>;
  onOpenSession: (edited: EditedSession) => void;
  onChangeDisplayDays: (startIndex: number, endIndex: number) => void;
  onChangeDisplayTimes: (start: number, end: number) => void;
};

const ScheduleContext = createContext<ScheduleContextValue | undefined>(undefined);

export const ScheduleContextProvider = ScheduleContext.Provider;

export function useScheduleContext(): ScheduleContextValue {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useScheduleContext must be used within a ScheduleContextProvider');
  }
  return context;
}
