import { useFetchers, useSubmit } from '@remix-run/react';
import { formatISO } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { v4 as uuid } from 'uuid';

import { areTimeSlotsOverlapping, moveTimeSlotStart } from './schedule/timeslots.ts';
import type { Session, TimeSlot } from './schedule/types.ts';

type SessionData = { id: string; trackId: string; start: string; end: string };

export function useSessions(initialSessions: Array<SessionData>, timezone: string) {
  const sessions = useOptimisticSessions(initialSessions, timezone);

  const submit = useSubmit();

  const add = (trackId: string, timeslot: TimeSlot) => {
    const conflicting = sessions.some((s) => s.trackId === trackId && areTimeSlotsOverlapping(timeslot, s.timeslot));
    if (conflicting) return;

    const id = uuid(); // TODO: let id from DB and use an optimisticId
    submit(
      {
        intent: 'add-session',
        id,
        trackId: trackId,
        start: formatISO(fromZonedTime(timeslot.start, timezone)),
        end: formatISO(fromZonedTime(timeslot.end, timezone)),
      },
      { method: 'POST', navigate: false, fetcherKey: `session:${id}` },
    );
  };

  const update = (session: Session, newTrackId: string, newTimeslot: TimeSlot) => {
    const updatedTimeslot = moveTimeSlotStart(session.timeslot, newTimeslot.start);

    const conflicting = sessions.some(
      (s) => s.id !== session.id && s.trackId === newTrackId && areTimeSlotsOverlapping(updatedTimeslot, s.timeslot),
    );
    if (conflicting) return;

    submit(
      {
        intent: 'update-session',
        id: session.id,
        trackId: newTrackId,
        start: formatISO(fromZonedTime(updatedTimeslot.start, timezone)),
        end: formatISO(fromZonedTime(updatedTimeslot.end, timezone)),
      },
      { method: 'POST', navigate: false, fetcherKey: `session:${session.id}`, unstable_flushSync: true },
    );
  };

  return { add, update, data: sessions };
}

function useOptimisticSessions(initialSessions: Array<SessionData>, timezone: string) {
  type PendingSession = ReturnType<typeof useFetchers>[number] & {
    formData: FormData;
  };

  const sessionsById = new Map(
    initialSessions.map(({ id, trackId, start, end }) => [
      id,
      {
        id,
        trackId,
        timeslot: { start: toZonedTime(start, timezone), end: toZonedTime(end, timezone) },
      },
    ]),
  );

  const fetchers = useFetchers();

  const pendingSessions = fetchers
    .filter((fetcher): fetcher is PendingSession => {
      if (!fetcher.formData) return false;
      const intent = fetcher.formData.get('intent');
      return intent === 'add-session' || intent === 'update-session';
    })
    .map((fetcher) => ({
      id: String(fetcher.formData?.get('id')),
      trackId: String(fetcher.formData?.get('trackId')),
      timeslot: {
        start: new Date(String(fetcher.formData?.get('startTime'))),
        end: new Date(String(fetcher.formData?.get('endTime'))),
      },
    }));

  for (let session of pendingSessions) {
    sessionsById.set(session.id, session);
  }

  return Array.from(sessionsById.values());
}
