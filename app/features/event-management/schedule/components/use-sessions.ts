import { useFetchers, useSubmit } from 'react-router';
import { type SessionMutation, SessionMutations, toScheduleSession } from '../models/session-mutation.ts';
import type { PlacementOutcome, SwapOutcome } from '../models/session-placement.ts';
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

  // Submits a Session at the placement returned by the model, so an adjusted gesture is shown adjusted.
  const submitPlacement = async (session: ScheduleSession, outcome: PlacementOutcome) => {
    if (outcome.status === 'conflict') return outcome;

    const { trackId, timeslot } = outcome.placement;
    await submitMutation(mutations.update({ ...session, trackId, timeslot }));
    return outcome;
  };

  const onAdd = async (session: Omit<ScheduleSession, 'id' | 'isCreating'>): Promise<PlacementOutcome> => {
    const outcome = placement.place({ trackId: session.trackId, timeslot: session.timeslot });
    if (outcome.status === 'conflict') return outcome;

    await submitMutation(mutations.add(session));
    return outcome;
  };

  const onUpdate = async (session: ScheduleSession): Promise<PlacementOutcome> => {
    const outcome = placement.place({ trackId: session.trackId, timeslot: session.timeslot }, session.id);
    if (outcome.status === 'conflict') return outcome;

    await submitMutation(mutations.update(session));
    return outcome;
  };

  const onMove = (session: ScheduleSession, target: { trackId: string; start: Date }): Promise<PlacementOutcome> =>
    submitPlacement(session, placement.move(session, target));

  const onResize = (session: ScheduleSession, end: Date): Promise<PlacementOutcome> =>
    submitPlacement(session, placement.resize(session, end));

  const onSwap = async (source: ScheduleSession, target: ScheduleSession): Promise<SwapOutcome> => {
    const outcome = placement.swap(source, target);
    if (outcome.status === 'conflict') return outcome;

    await submitMutation(mutations.switch(source, target));
    return outcome;
  };

  const onDelete = async (session: ScheduleSession) => {
    const { formData } = mutations.delete(session);
    await submit(formData, { method: 'POST', navigate: false, preventScrollReset: true });
  };

  return {
    add: onAdd,
    update: onUpdate,
    move: onMove,
    resize: onResize,
    swap: onSwap,
    delete: onDelete,
    data: sessions,
  };
}
