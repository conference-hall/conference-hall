import { useFetchers, useSubmit } from 'react-router';
import { type SessionMutation, SessionMutations, toScheduleSession } from '../models/session-mutation.ts';
import { SessionPlacement } from '../models/session-placement.ts';
import type { ScheduleSession, SessionData } from './schedule.types.ts';

export function useSessions(initialSessions: Array<SessionData>, timezone: string) {
  const mutations = new SessionMutations(timezone);
  const fetchers = useFetchers();
  const sessions = mutations.applyPending(
    initialSessions.map((session) => toScheduleSession(session, timezone)),
    fetchers,
  );
  const placement = new SessionPlacement(sessions);

  const submit = useSubmit();

  const submitMutation = async ({ key, formData }: SessionMutation) => {
    await submit(formData, {
      method: 'POST',
      navigate: false,
      fetcherKey: key,
      flushSync: true,
      preventScrollReset: true,
    });
  };

  const onAdd = async (session: Omit<ScheduleSession, 'id' | 'isCreating'>) => {
    const outcome = placement.place({ trackId: session.trackId, timeslot: session.timeslot });
    if (outcome.status === 'conflict') return false;

    await submitMutation(mutations.add(session));
    return true;
  };

  const onUpdate = async (session: ScheduleSession) => {
    const outcome = placement.place({ trackId: session.trackId, timeslot: session.timeslot }, session.id);
    if (outcome.status === 'conflict') return false;

    await submitMutation(mutations.update(session));
    return true;
  };

  const onSwitch = async (source: ScheduleSession, target: ScheduleSession) => {
    const outcome = placement.swap(source, target);
    if (outcome.status === 'conflict') return false;

    await submitMutation(mutations.switch(source, target));
    return true;
  };

  const onDelete = async (session: ScheduleSession) => {
    const { formData } = mutations.delete(session);
    await submit(formData, { method: 'POST', navigate: false, preventScrollReset: true });
  };

  return {
    add: onAdd,
    update: onUpdate,
    switch: onSwitch,
    delete: onDelete,
    data: sessions,
  };
}
