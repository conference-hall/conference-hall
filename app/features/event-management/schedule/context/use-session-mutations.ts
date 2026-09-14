import { useCallback, useMemo } from 'react';
import { useSubmit } from 'react-router';
import type { ScheduleSession } from '../components/schedule.types.ts';
import type { ScheduleTime } from '../models/schedule-time.ts';
import { type SessionMutation, SessionMutations } from '../models/session-mutation.ts';
import type { ScheduleStore } from '../store/schedule-store.ts';

// The Session mutations, bound to the Sessions displayed now. Each call reads the store, so the Placement rule
// always runs against what the organizer sees, including the mutations still in flight; the actions themselves
// never change identity, so putting them in the Schedule context re-renders nobody.

export type SessionActions = {
  add: (session: Omit<ScheduleSession, 'id' | 'isCreating'>) => ReturnType<SessionMutations['add']>;
  update: SessionMutations['update'];
  move: SessionMutations['move'];
  resize: SessionMutations['resize'];
  swap: SessionMutations['swap'];
  delete: SessionMutations['delete'];
};

export function useSessionMutations(store: ScheduleStore, scheduleTime: ScheduleTime): SessionActions {
  const submit = useSubmit();

  // One fetcher per mutated Session: a second gesture on the same Session aborts the first, gestures on two
  // Sessions run in parallel, and a keyed submit is flushed synchronously so the block never blinks back.
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

  return useMemo(() => {
    const current = () => new SessionMutations(store.getAll(), { scheduleTime, submit: submitSession });
    return {
      add: (session) => current().add(session),
      update: (session) => current().update(session),
      move: (session, target) => current().move(session, target),
      resize: (session, end) => current().resize(session, end),
      swap: (source, target) => current().swap(source, target),
      delete: (session) => current().delete(session),
    };
  }, [store, scheduleTime, submitSession]);
}
