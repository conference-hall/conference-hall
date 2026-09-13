import { useCallback, useMemo } from 'react';
import { useFetchers, useSubmit } from 'react-router';
import type { ScheduleTime } from '../models/schedule-time.ts';
import { pendingSessions, type SessionMutation, SessionMutations } from '../models/session-mutation.ts';
import type { SessionData } from './schedule.types.ts';

export function useSessions(initialSessions: Array<SessionData>, scheduleTime: ScheduleTime) {
  const fetchers = useFetchers();
  const submit = useSubmit();

  // Every reference is kept between two renders without change: the grid model and the memoized slots downstream
  // are rebuilt on a Session change, never on a render of the route.
  const sessions = useMemo(
    () => pendingSessions(initialSessions, fetchers, scheduleTime),
    [initialSessions, fetchers, scheduleTime],
  );

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

  const mutations = useMemo(
    () => new SessionMutations(sessions, { scheduleTime, submit: submitSession }),
    [sessions, scheduleTime, submitSession],
  );

  return useMemo(
    () => ({
      add: mutations.add,
      update: mutations.update,
      move: mutations.move,
      resize: mutations.resize,
      swap: mutations.swap,
      delete: mutations.delete,
      data: sessions,
    }),
    [mutations, sessions],
  );
}
