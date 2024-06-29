import { useState } from 'react';

import {
  areTimeSlotsOverlapping,
  formatTimeSlot,
  haveSameStartDate,
  isTimeSlotIncluded,
  type TimeSlot,
} from './timeslots.ts';

export type Session = {
  track: number;
  timeslot: TimeSlot;
};

export function useSessions() {
  const [sessions, setSession] = useState<Array<Session>>([]);

  const addSession = (track: number, timeslot: TimeSlot) => {
    const conflicting = sessions.some(
      (session) => session.track === track && areTimeSlotsOverlapping(timeslot, session.timeslot),
    );
    if (conflicting) return;
    console.log('Track', track, formatTimeSlot(timeslot));
    setSession((s) => [...s, { track, timeslot }]);
  };

  const getSession = (track: number, timeslot: TimeSlot) => {
    return sessions.find((session) => session.track === track && haveSameStartDate(session.timeslot, timeslot));
  };

  const hasSession = (track: number, timeslot: TimeSlot) => {
    return sessions.some((session) => session.track === track && isTimeSlotIncluded(timeslot, session.timeslot));
  };

  return { addSession, getSession, hasSession };
}
