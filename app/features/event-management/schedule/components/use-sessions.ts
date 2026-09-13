import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFetchers, useSubmit } from 'react-router';
import type { ScheduleTime } from '../models/schedule-time.ts';
import { pendingSessions, type SessionMutation, SessionMutations } from '../models/session-mutation.ts';
import type { ScheduleSession, SessionData } from './schedule.types.ts';

export function useSessions(initialSessions: Array<SessionData>, scheduleTime: ScheduleTime) {
  const fetchers = useFetchers();
  const submit = useSubmit();

  // Every reference is kept between two renders without change: the grid model and the memoized slots downstream
  // are rebuilt on a Session change, never on a render of the route.
  const sessions = useMemo(
    () => pendingSessions(initialSessions, fetchers, scheduleTime),
    [initialSessions, fetchers, scheduleTime],
  );

  // The mutations read the sessions from a ref: their callbacks keep their reference across a Session change, so
  // neither the grid nor the Schedule context re-renders on their account. A gesture is placed against the
  // sessions drawn at that moment.
  const sessionsRef = useRef(sessions);
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  const submitSession = useCallback(
    async ({ key, formData }: SessionMutation) => {
      await submit(formData, {
        method: 'POST',
        navigate: false,
        fetcherKey: key,
        flushSync: key !== undefined,
        preventScrollReset: true,
      });
    },
    [submit],
  );

  const mutations = useMemo(() => {
    const current = () => new SessionMutations(sessionsRef.current, { scheduleTime, submit: submitSession });
    return {
      add: (session: Omit<ScheduleSession, 'id' | 'isCreating'>) => current().add(session),
      update: (session: ScheduleSession) => current().update(session),
      move: (session: ScheduleSession, target: { trackId: string; start: Date }) => current().move(session, target),
      resize: (session: ScheduleSession, end: Date) => current().resize(session, end),
      swap: (source: ScheduleSession, target: ScheduleSession) => current().swap(source, target),
      delete: (session: ScheduleSession) => current().delete(session),
    };
  }, [scheduleTime, submitSession]);

  return useMemo(() => ({ ...mutations, data: sessions }), [mutations, sessions]);
}
