import type { TimeSlot } from '~/shared/datetimes/timeslots.ts';
import type { Language } from '~/shared/types/proposals.types.ts';
import type { ScheduleSession, SessionData } from '../components/schedule.types.ts';
import { DEFAULT_SESSION_COLOR } from '../components/session/constants.ts';
import type { ScheduleTime } from './schedule-time.ts';
import { type PlacementOutcome, SessionPlacement, type SwapOutcome } from './session-placement.ts';

export const SESSION_INTENTS = {
  add: 'add-session',
  update: 'update-session',
  switch: 'switch-sessions',
  delete: 'delete-session',
} as const;

export type SessionMutation = { key?: string; formData: FormData };

type SessionIntent = (typeof SESSION_INTENTS)[keyof typeof SESSION_INTENTS];

type PendingFetcher = { formData?: FormData };

type Dependencies = { scheduleTime: ScheduleTime; submit: (mutation: SessionMutation) => Promise<void> };

// Applies the mutations still in flight on top of the sessions known by the server.
export function pendingSessions(
  data: Array<SessionData>,
  fetchers: Array<PendingFetcher>,
  scheduleTime: ScheduleTime,
): Array<ScheduleSession> {
  const sessionsById = new Map(data.map((session) => [session.id, scheduleTime.session(session)]));

  for (const { formData } of fetchers) {
    if (!formData) continue;

    switch (formData.get('intent')) {
      case SESSION_INTENTS.add:
      case SESSION_INTENTS.update: {
        const pending = decodeSession(formData, scheduleTime);
        const current = sessionsById.get(pending.id);
        const proposal = current?.proposal?.id === pending.proposal?.id ? current?.proposal : pending.proposal;
        sessionsById.set(pending.id, { ...pending, proposal });
        break;
      }
      case SESSION_INTENTS.switch: {
        const source = sessionsById.get(String(formData.get('sourceId')));
        const target = sessionsById.get(String(formData.get('targetId')));
        if (!source || !target) break;
        const outcome = new SessionPlacement(Array.from(sessionsById.values())).swap(source, target);
        if (outcome.status === 'conflict') break;
        sessionsById.set(source.id, { ...source, ...outcome.source });
        sessionsById.set(target.id, { ...target, ...outcome.target });
        break;
      }
      case SESSION_INTENTS.delete: {
        sessionsById.delete(String(formData.get('id')));
        break;
      }
    }
  }

  return Array.from(sessionsById.values());
}

export class SessionMutations {
  private placement: SessionPlacement;

  constructor(
    sessions: Array<ScheduleSession>,
    private deps: Dependencies,
  ) {
    this.placement = new SessionPlacement(sessions);
  }

  static blank({ trackId, timeslot }: { trackId: string; timeslot: TimeSlot }): ScheduleSession {
    return {
      id: 'new',
      trackId,
      timeslot,
      name: '',
      language: null,
      color: DEFAULT_SESSION_COLOR,
      emojis: [],
      proposal: null,
    };
  }

  add = async (session: Omit<ScheduleSession, 'id' | 'isCreating'>): Promise<PlacementOutcome> => {
    const outcome = this.placement.place({ trackId: session.trackId, timeslot: session.timeslot });
    if (outcome.status === 'conflict') return outcome;

    await this.submitSession(SESSION_INTENTS.add, { ...session, id: crypto.randomUUID() });
    return outcome;
  };

  update = async (session: ScheduleSession): Promise<PlacementOutcome> => {
    const outcome = this.placement.place({ trackId: session.trackId, timeslot: session.timeslot }, session.id);
    if (outcome.status === 'conflict') return outcome;

    await this.submitSession(SESSION_INTENTS.update, session);
    return outcome;
  };

  move = (session: ScheduleSession, target: { trackId: string; start: Date }): Promise<PlacementOutcome> =>
    this.submitPlacement(session, this.placement.move(session, target));

  resize = (session: ScheduleSession, end: Date): Promise<PlacementOutcome> =>
    this.submitPlacement(session, this.placement.resize(session, end));

  swap = async (source: ScheduleSession, target: ScheduleSession): Promise<SwapOutcome> => {
    const outcome = this.placement.swap(source, target);
    if (outcome.status === 'conflict') return outcome;

    const formData = new FormData();
    formData.set('intent', SESSION_INTENTS.switch);
    formData.set('sourceId', source.id);
    formData.set('targetId', target.id);
    await this.deps.submit({ key: `session:${source.id}`, formData });
    return outcome;
  };

  delete = async (session: ScheduleSession): Promise<void> => {
    const formData = new FormData();
    formData.set('intent', SESSION_INTENTS.delete);
    formData.set('id', session.id);
    await this.deps.submit({ formData });
  };

  private async submitPlacement(session: ScheduleSession, outcome: PlacementOutcome): Promise<PlacementOutcome> {
    if (outcome.status === 'conflict') return outcome;

    await this.submitSession(SESSION_INTENTS.update, { ...session, ...outcome.placement });
    return outcome;
  }

  private async submitSession(intent: SessionIntent, session: ScheduleSession): Promise<void> {
    const formData = new FormData();
    formData.set('intent', intent);
    formData.set('id', session.id);
    formData.set('trackId', session.trackId);
    formData.set('start', this.deps.scheduleTime.toUtc(session.timeslot.start).toISOString());
    formData.set('end', this.deps.scheduleTime.toUtc(session.timeslot.end).toISOString());
    formData.set('color', session.color);
    formData.set('name', session.name ?? '');
    formData.set('language', session.language ?? '');
    formData.set('proposalId', session.proposal?.id ?? '');
    formData.set('proposalTitle', session.proposal?.title ?? '');
    formData.set('proposalRouteId', session.proposal?.routeId ?? '');
    for (const emoji of session.emojis) {
      formData.append('emojis', emoji);
    }
    await this.deps.submit({ key: `session:${session.id}`, formData });
  }
}

function decodeSession(formData: FormData, scheduleTime: ScheduleTime): ScheduleSession {
  const proposalId = String(formData.get('proposalId') ?? '');
  return {
    id: String(formData.get('id')),
    trackId: String(formData.get('trackId')),
    timeslot: {
      start: scheduleTime.fromUtc(new Date(String(formData.get('start')))),
      end: scheduleTime.fromUtc(new Date(String(formData.get('end')))),
    },
    color: String(formData.get('color')),
    name: String(formData.get('name') ?? '') || null,
    language: (String(formData.get('language') ?? '') || null) as Language | null,
    emojis: formData.getAll('emojis').map(String),
    proposal: proposalId
      ? {
          id: proposalId,
          title: String(formData.get('proposalTitle') ?? ''),
          routeId: String(formData.get('proposalRouteId') ?? ''),
          speakers: [],
        }
      : null,
    isCreating: formData.get('intent') === SESSION_INTENTS.add,
  };
}
