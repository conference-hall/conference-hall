import { useState } from 'react';

import type { Session, TimeSlot } from '../types.ts';
import { areTimeSlotsOverlapping, haveSameStartDate, isTimeSlotIncluded } from '../utils/timeslots.ts';

export function useSessions(initialSessions: Array<Session> = []) {
  const [sessions, setSession] = useState<Array<Session>>(initialSessions);

  const addSession = (trackId: string, timeslot: TimeSlot) => {
    const conflicting = sessions.some(
      (session) => session.trackId === trackId && areTimeSlotsOverlapping(timeslot, session.timeslot),
    );
    if (conflicting) return false;
    setSession((s) => [...s, { trackId, timeslot }]);
    return true;
  };

  const getSession = (trackId: string, timeslot: TimeSlot) => {
    return sessions.find((session) => session.trackId === trackId && haveSameStartDate(session.timeslot, timeslot));
  };

  const hasSession = (trackId: string, timeslot: TimeSlot) => {
    return sessions.some((session) => session.trackId === trackId && isTimeSlotIncluded(timeslot, session.timeslot));
  };

  return { addSession, getSession, hasSession };
}
