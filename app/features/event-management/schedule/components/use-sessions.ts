import { useFetchers, useSubmit } from 'react-router';
import { v4 as uuid } from 'uuid';
import type { TimeSlot } from '~/libs/datetimes/timeslots.ts';
import { areTimeSlotsOverlapping } from '~/libs/datetimes/timeslots.ts';
import { timezoneToUtc, utcToTimezone } from '~/libs/datetimes/timezone.ts';
import type { Language } from '~/shared/types/proposals.types.ts';
import type { ScheduleSession, SessionData } from './schedule.types.ts';

export function useSessions(initialSessions: Array<SessionData>, timezone: string) {
  const sessions = useOptimisticSessions(initialSessions, timezone);

  const submit = useSubmit();

  const onAdd = async (trackId: string, timeslot: TimeSlot) => {
    const conflicting = sessions.some((s) => s.trackId === trackId && areTimeSlotsOverlapping(timeslot, s.timeslot));
    if (conflicting) return;

    const id = uuid();
    await submit(
      {
        intent: 'add-session',
        id,
        trackId: trackId,
        start: timezoneToUtc(timeslot.start, timezone).toISOString(),
        end: timezoneToUtc(timeslot.end, timezone).toISOString(),
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

  const update = async (session: ScheduleSession) => {
    const formData = new FormData();
    formData.set('intent', 'update-session');
    formData.set('id', session.id);
    formData.set('trackId', session.trackId);
    formData.set('start', timezoneToUtc(session.timeslot.start, timezone).toISOString());
    formData.set('end', timezoneToUtc(session.timeslot.end, timezone).toISOString());
    formData.set('color', session.color);
    formData.set('name', session.name ?? '');
    formData.set('language', session.language ?? '');
    formData.set('proposalId', session.proposal?.id ?? '');
    for (const emoji of session.emojis) {
      formData.append('emojis', emoji);
    }

    await submit(formData, {
      method: 'POST',
      navigate: false,
      fetcherKey: `session:${session.id}`,
      flushSync: true,
      preventScrollReset: true,
    });
  };

  const onUpdate = async (updatedSession: ScheduleSession) => {
    const conflicting = sessions.some(
      (s) =>
        s.id !== updatedSession.id &&
        s.trackId === updatedSession.trackId &&
        areTimeSlotsOverlapping(updatedSession.timeslot, s.timeslot),
    );
    if (conflicting) return false;

    await update(updatedSession);
    return true;
  };

  const onSwitch = async (source: ScheduleSession, target: ScheduleSession) => {
    await update({ ...source, trackId: target.trackId, timeslot: target.timeslot });
    await update({ ...target, trackId: source.trackId, timeslot: source.timeslot });
  };

  const onDelete = async (session: ScheduleSession) => {
    await submit(
      { intent: 'delete-session', id: session.id },
      { method: 'POST', navigate: false, preventScrollReset: true },
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
    initialSessions.map(({ id, trackId, start, end, name, language, color, emojis, proposal }) => [
      id,
      {
        id,
        trackId,
        timeslot: { start: utcToTimezone(start, timezone), end: utcToTimezone(end, timezone) },
        name,
        language,
        color,
        emojis,
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
      language: String(fetcher.formData?.get('language') ?? '') as Language | null,
      emojis: fetcher.formData?.getAll('emojis') as string[],
      isCreating: fetcher.formData.get('intent') === 'add-session',
      timeslot: {
        start: utcToTimezone(String(fetcher.formData?.get('start')), timezone),
        end: utcToTimezone(String(fetcher.formData?.get('end')), timezone),
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
