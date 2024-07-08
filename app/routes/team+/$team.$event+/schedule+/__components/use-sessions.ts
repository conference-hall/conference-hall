import { useFetchers, useSubmit } from '@remix-run/react';
import { formatISO } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { v4 as uuid } from 'uuid';

import type { ScheduleSession, SessionData, TimeSlot } from './schedule.types.ts';
import { areTimeSlotsOverlapping, moveTimeSlotStart } from './schedule/timeslots.ts';

export function useSessions(initialSessions: Array<SessionData>, timezone: string) {
  const sessions = useOptimisticSessions(initialSessions, timezone);

  const submit = useSubmit();

  const onAdd = (trackId: string, timeslot: TimeSlot) => {
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
      {
        method: 'POST',
        navigate: false,
        fetcherKey: `session:${id}`,
        unstable_flushSync: true,
        preventScrollReset: true,
      },
    );
  };

  const onDelete = (session: ScheduleSession) => {
    submit(
      {
        intent: 'delete-session',
        id: session.id,
      },
      {
        method: 'POST',
        navigate: false,
        fetcherKey: `session:${session.id}`,
        unstable_flushSync: true,
        preventScrollReset: true,
      },
    );
  };

  const update = (session: ScheduleSession, newTrackId: string, newTimeslot: TimeSlot, proposalId?: string) => {
    submit(
      {
        intent: 'update-session',
        id: session.id,
        trackId: newTrackId,
        start: formatISO(fromZonedTime(newTimeslot.start, timezone)),
        end: formatISO(fromZonedTime(newTimeslot.end, timezone)),
        proposalId: proposalId ?? '',
      },
      {
        method: 'POST',
        navigate: false,
        fetcherKey: `session:${session.id}`,
        unstable_flushSync: true,
        preventScrollReset: true,
      },
    );
  };

  const onUpdate = (session: ScheduleSession, newTrackId: string, newTimeslot: TimeSlot, proposalId?: string) => {
    const conflicting = sessions.some(
      (s) => s.id !== session.id && s.trackId === newTrackId && areTimeSlotsOverlapping(newTimeslot, s.timeslot),
    );
    if (conflicting) return;

    update(session, newTrackId, newTimeslot, proposalId);
  };

  const onMove = (session: ScheduleSession, newTrackId: string, newTimeslot: TimeSlot) => {
    const updatedTimeslot = moveTimeSlotStart(session.timeslot, newTimeslot.start);

    const conflicting = sessions.some(
      (s) => s.id !== session.id && s.trackId === newTrackId && areTimeSlotsOverlapping(updatedTimeslot, s.timeslot),
    );
    if (conflicting) return;

    update(session, newTrackId, updatedTimeslot);
  };

  const onSwitch = (source: ScheduleSession, target: ScheduleSession) => {
    update(source, target.trackId, target.timeslot);
    update(target, source.trackId, source.timeslot);
  };

  return {
    add: onAdd,
    delete: onDelete,
    update: onUpdate,
    move: onMove,
    switch: onSwitch,
    data: sessions,
  };
}

function useOptimisticSessions(initialSessions: Array<SessionData>, timezone: string) {
  type PendingSession = ReturnType<typeof useFetchers>[number] & {
    formData: FormData;
  };

  const sessionsById = new Map(
    initialSessions.map(({ id, trackId, start, end, proposal }) => [
      id,
      {
        id,
        trackId,
        timeslot: { start: toZonedTime(start, timezone), end: toZonedTime(end, timezone) },
        proposal,
      },
    ]),
  );

  const fetchers = useFetchers();

  // Pending add & update
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
        start: toZonedTime(String(fetcher.formData?.get('start')), timezone),
        end: toZonedTime(String(fetcher.formData?.get('end')), timezone),
      },
    }));

  for (let session of pendingSessions) {
    const current = sessionsById.get(session.id);
    sessionsById.set(session.id, { ...session, proposal: current?.proposal });
  }

  // Pending delete
  fetchers
    .filter((fetcher): fetcher is PendingSession => {
      if (!fetcher.formData) return false;
      const intent = fetcher.formData.get('intent');
      return intent === 'delete-session';
    })
    .forEach((fetcher) => {
      sessionsById.delete(String(fetcher.formData?.get('id')));
    });

  return Array.from(sessionsById.values());
}
