import { useFetchers, useSubmit } from '@remix-run/react';
import { formatISO } from 'date-fns';
import { v4 as uuid } from 'uuid';

import { areTimeSlotsOverlapping, moveTimeSlotStart } from './__components/schedule/timeslots.ts';
import type { Session, TimeSlot } from './__components/schedule/types.ts';

type SessionData = { id: string; trackId: string; startTime: string; endTime: string };

export function useSessions(initialSessions: Array<SessionData>) {
  const sessions = useOptimisticSessions(initialSessions);

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
        startTime: formatISO(timeslot.start),
        endTime: formatISO(timeslot.end),
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
        startTime: formatISO(updatedTimeslot.start),
        endTime: formatISO(updatedTimeslot.end),
      },
      { method: 'POST', navigate: false, fetcherKey: `session:${session.id}`, unstable_flushSync: true },
    );
  };

  return { add, update, data: sessions };
}

function useOptimisticSessions(initialSessions: Array<SessionData>) {
  type PendingSession = ReturnType<typeof useFetchers>[number] & {
    formData: FormData;
  };

  const sessionsById = new Map(
    initialSessions.map(({ id, trackId, startTime, endTime }) => [
      id,
      {
        id,
        trackId,
        timeslot: { start: new Date(startTime), end: new Date(endTime) },
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
