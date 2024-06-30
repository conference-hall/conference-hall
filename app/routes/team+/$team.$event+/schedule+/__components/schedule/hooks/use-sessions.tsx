import { useState } from 'react';

import type { Session, TimeSlot } from '../types.ts';
import {
  areTimeSlotsOverlapping,
  haveSameStartDate,
  isTimeSlotIncluded,
  moveTimeSlotStart,
} from '../utils/timeslots.ts';

export function useSessions(initialSessions: Array<Session> = []) {
  const [sessions, setSession] = useState<Array<Session>>(initialSessions);

  const addSession = (session: Session) => {
    const { trackId, timeslot } = session;

    const conflicting = sessions.some(
      (session) => session.trackId === trackId && areTimeSlotsOverlapping(timeslot, session.timeslot),
    );
    if (conflicting) return false;
    setSession((sessions) => [...sessions, session]);
    return true;
  };

  const getSession = (trackId: string, timeslot: TimeSlot) => {
    return sessions.find((session) => session.trackId === trackId && haveSameStartDate(session.timeslot, timeslot));
  };

  const hasSession = (trackId: string, timeslot: TimeSlot) => {
    return sessions.some((session) => session.trackId === trackId && isTimeSlotIncluded(timeslot, session.timeslot));
  };

  const moveSession = (session: Session, newTrackId: string, newTimeslot: TimeSlot) => {
    const updatedTimeslot = moveTimeSlotStart(session.timeslot, newTimeslot.start);

    const conflicting = sessions.some(
      (s) => s.id !== session.id && s.trackId === newTrackId && areTimeSlotsOverlapping(updatedTimeslot, s.timeslot),
    );
    if (conflicting) return;

    setSession((sessions) => [
      ...sessions.filter((s) => s.id !== session.id),
      { ...session, trackId: newTrackId, timeslot: updatedTimeslot },
    ]);
  };

  return { getSession, addSession, moveSession, hasSession };
}
