import { toZonedTime } from 'date-fns-tz';
import { useFetchers, useSubmit } from 'react-router';
import { v4 as uuid } from 'uuid';

import type { TimeSlot } from '~/libs/datetimes/timeslots.ts';
import { areTimeSlotsOverlapping } from '~/libs/datetimes/timeslots.ts';
import { formatZonedTimeToUtc } from '~/libs/datetimes/timezone.ts';

import type { ScheduleSession, SessionData } from './schedule.types.ts';

export function useSessions(initialSessions: Array<SessionData>, timezone: string) {
  const sessions = useOptimisticSessions(initialSessions, timezone);

  const submit = useSubmit();

  const onAdd = (trackId: string, timeslot: TimeSlot) => {
    const conflicting = sessions.some((s) => s.trackId === trackId && areTimeSlotsOverlapping(timeslot, s.timeslot));
    if (conflicting) return;

    const id = uuid();
    submit(
      {
        intent: 'add-session',
        id,
        trackId: trackId,
        start: formatZonedTimeToUtc(timeslot.start, timezone),
        end: formatZonedTimeToUtc(timeslot.end, timezone),
      },
      {
        method: 'POST',
        navigate: false,
        fetcherKey: `session:${id}`,
        flushSync: true,
        preventScrollReset: true,
      },
    );
  };

  const update = (session: ScheduleSession) => {
    submit(
      {
        intent: 'update-session',
        id: session.id,
        trackId: session.trackId,
        start: formatZonedTimeToUtc(session.timeslot.start, timezone),
        end: formatZonedTimeToUtc(session.timeslot.end, timezone),
        color: session.color,
        name: session.name ?? '',
        proposalId: session.proposal?.id ?? '',
      },
      {
        method: 'POST',
        navigate: false,
        fetcherKey: `session:${session.id}`,
        flushSync: true,
        preventScrollReset: true,
      },
    );
  };

  const onUpdate = (updatedSession: ScheduleSession) => {
    const conflicting = sessions.some(
      (s) =>
        s.id !== updatedSession.id &&
        s.trackId === updatedSession.trackId &&
        areTimeSlotsOverlapping(updatedSession.timeslot, s.timeslot),
    );
    if (conflicting) return false;

    update(updatedSession);
    return true;
  };

  const onSwitch = (source: ScheduleSession, target: ScheduleSession) => {
    update({ ...source, trackId: target.trackId, timeslot: target.timeslot });
    update({ ...target, trackId: source.trackId, timeslot: source.timeslot });
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
        preventScrollReset: true,
      },
    );
  };

  return {
    add: onAdd,
    update: onUpdate,
    switch: onSwitch,
    delete: onDelete,
    data: sessions,
  };
}

function useOptimisticSessions(initialSessions: Array<SessionData>, timezone: string) {
  type PendingSession = ReturnType<typeof useFetchers>[number] & {
    formData: FormData;
  };

  const sessionsById = new Map(
    initialSessions.map(({ id, trackId, start, end, name, color, proposal }) => [
      id,
      {
        id,
        trackId,
        timeslot: { start: toZonedTime(start, timezone), end: toZonedTime(end, timezone) },
        name,
        color,
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
      color: String(fetcher.formData?.get('color') ?? 'gray'),
      name: String(fetcher.formData?.get('name') ?? ''),
      timeslot: {
        start: toZonedTime(String(fetcher.formData?.get('start')), timezone),
        end: toZonedTime(String(fetcher.formData?.get('end')), timezone),
      },
    }));

  for (const session of pendingSessions) {
    const current = sessionsById.get(session.id);
    sessionsById.set(session.id, { ...session, proposal: current?.proposal });
  }

  // Pending delete
  const deleteFetchers = fetchers.filter((fetcher): fetcher is PendingSession => {
    if (!fetcher.formData) return false;
    const intent = fetcher.formData.get('intent');
    return intent === 'delete-session';
  });

  for (const fetcher of deleteFetchers) {
    sessionsById.delete(String(fetcher.formData?.get('id')));
  }

  return Array.from(sessionsById.values());
}
