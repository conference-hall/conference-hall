import { addMinutes } from 'date-fns';
import { areTimeSlotsOverlapping, moveTimeSlotStart, type TimeSlot } from '~/shared/datetimes/timeslots.ts';

// Owns the rule for positioning a Session in a Track: a Session never overlaps another Session of the same Track.
// Time reference contract: all the dates given to a single call must share the same time reference

// Length given to a Session whose requested end is not after its start.
const MINIMUM_SESSION_MINUTES = 5;

export type Placement = { trackId: string; timeslot: TimeSlot };

export type PlacedSession = Placement & { id: string };

export type PlacementOutcome =
  | { status: 'placed'; placement: Placement }
  | { status: 'adjusted'; placement: Placement }
  | { status: 'conflict'; conflictingSession: PlacedSession };

export type SwapOutcome =
  | { status: 'placed'; source: Placement; target: Placement }
  | { status: 'conflict'; conflictingSession: PlacedSession };

export class SessionPlacement {
  constructor(private sessions: Array<PlacedSession>) {}

  // Places a Session at an exact time slot. Never adjusts: an overlap is refused.
  place(placement: Placement, placedSessionId?: string): PlacementOutcome {
    const conflictingSession = this.trackSessions(placement.trackId, placedSessionId).find((session) =>
      areTimeSlotsOverlapping(placement.timeslot, session.timeslot),
    );
    if (conflictingSession) return { status: 'conflict', conflictingSession };

    return { status: 'placed', placement };
  }

  // Moves a Session to a Track and a start time, keeping its duration.
  move(session: PlacedSession, target: { trackId: string; start: Date }): PlacementOutcome {
    return this.fit(session, target.trackId, moveTimeSlotStart(session.timeslot, target.start));
  }

  // Resizes a Session by its end, keeping its Track and its start.
  resize(session: PlacedSession, end: Date): PlacementOutcome {
    return this.fit(session, session.trackId, { start: session.timeslot.start, end });
  }

  // Exchanges the Track and the start time of two Sessions, each keeping its own duration.
  swap(source: PlacedSession, target: PlacedSession): SwapOutcome {
    const sourcePlacement = {
      trackId: target.trackId,
      timeslot: moveTimeSlotStart(source.timeslot, target.timeslot.start),
    };
    const targetPlacement = {
      trackId: source.trackId,
      timeslot: moveTimeSlotStart(target.timeslot, source.timeslot.start),
    };
    if (source.id === target.id) return { status: 'placed', source: sourcePlacement, target: targetPlacement };

    // Both Sessions leave their slot at once, so neither is checked against the other's former position.
    const remaining = this.sessions.filter((session) => session.id !== source.id && session.id !== target.id);
    const movedTarget = { id: target.id, ...targetPlacement };

    const sourceOutcome = new SessionPlacement([...remaining, movedTarget]).place(sourcePlacement);
    if (sourceOutcome.status === 'conflict') return sourceOutcome;

    // The two Sessions against each other are already covered above, so the target only faces the rest.
    const targetOutcome = new SessionPlacement(remaining).place(targetPlacement);
    if (targetOutcome.status === 'conflict') return targetOutcome;

    return { status: 'placed', source: sourcePlacement, target: targetPlacement };
  }

  // Places a Session as close as possible to what was asked: the end is clamped to the next Session of the Track
  // and to a minimum length, and only a start with no room at all is refused.
  private fit(session: PlacedSession, trackId: string, requested: TimeSlot): PlacementOutcome {
    const trackSessions = this.trackSessions(trackId, session.id);
    const { start } = requested;
    const minimumEnd = addMinutes(start, MINIMUM_SESSION_MINUTES);

    const conflictingSession = trackSessions.find((s) =>
      areTimeSlotsOverlapping({ start, end: minimumEnd }, s.timeslot),
    );
    if (conflictingSession) return { status: 'conflict', conflictingSession };

    const nextSession = trackSessions.find((s) => s.timeslot.start > start);

    let end = requested.end;
    if (end < minimumEnd) end = minimumEnd;
    if (nextSession && end > nextSession.timeslot.start) end = nextSession.timeslot.start;

    const status = end.getTime() === requested.end.getTime() ? 'placed' : 'adjusted';
    return { status, placement: { trackId, timeslot: { start, end } } };
  }

  private trackSessions(trackId: string, excludedSessionId?: string) {
    return this.sessions
      .filter((session) => session.trackId === trackId && session.id !== excludedSessionId)
      .toSorted((a, b) => a.timeslot.start.getTime() - b.timeslot.start.getTime());
  }
}
