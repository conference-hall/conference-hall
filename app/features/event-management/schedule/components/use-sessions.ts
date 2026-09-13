import { useFetchers, useSubmit } from 'react-router';
import type { ScheduleTime } from '../models/schedule-time.ts';
import { pendingSessions, type SessionMutation, SessionMutations } from '../models/session-mutation.ts';
import type { SessionData } from './schedule.types.ts';

export function useSessions(initialSessions: Array<SessionData>, scheduleTime: ScheduleTime) {
  const fetchers = useFetchers();
  const submit = useSubmit();

  const sessions = pendingSessions(initialSessions, fetchers, scheduleTime);

  const mutations = new SessionMutations(sessions, {
    scheduleTime,
    submit: async ({ key, formData }: SessionMutation) => {
      await submit(formData, {
        method: 'POST',
        navigate: false,
        fetcherKey: key,
        flushSync: key !== undefined,
        preventScrollReset: true,
      });
    },
  });

  return {
    add: mutations.add,
    update: mutations.update,
    move: mutations.move,
    resize: mutations.resize,
    swap: mutations.swap,
    delete: mutations.delete,
    data: sessions,
  };
}
