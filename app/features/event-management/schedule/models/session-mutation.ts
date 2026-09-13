import { moveTimeSlotStart } from '~/shared/datetimes/timeslots.ts';
import type { Language } from '~/shared/types/proposals.types.ts';
import type { ScheduleSession } from '../components/schedule.types.ts';
import type { ScheduleTime } from './schedule-time.ts';

// Owns the wire format of a Session mutation: for optimistic updates.
// Time reference contract: sessions are given and returned in the Schedule timezone, the wire carries UTC.

export const SESSION_INTENTS = {
  add: 'add-session',
  update: 'update-session',
  switch: 'switch-sessions',
  delete: 'delete-session',
} as const;

export type SessionMutation = { key?: string; formData: FormData };

type SessionIntent = (typeof SESSION_INTENTS)[keyof typeof SESSION_INTENTS];

type PendingFetcher = { formData?: FormData };

export class SessionMutations {
  constructor(private scheduleTime: ScheduleTime) {}

  add(session: Omit<ScheduleSession, 'id' | 'isCreating'>): SessionMutation {
    return this.sessionMutation(SESSION_INTENTS.add, { ...session, id: crypto.randomUUID() });
  }

  update(session: ScheduleSession): SessionMutation {
    return this.sessionMutation(SESSION_INTENTS.update, session);
  }

  switch(source: ScheduleSession, target: ScheduleSession): SessionMutation {
    const formData = new FormData();
    formData.set('intent', SESSION_INTENTS.switch);
    formData.set('sourceId', source.id);
    formData.set('targetId', target.id);
    return { key: `session:${source.id}`, formData };
  }

  delete(session: ScheduleSession): SessionMutation {
    const formData = new FormData();
    formData.set('intent', SESSION_INTENTS.delete);
    formData.set('id', session.id);
    return { formData };
  }

  // Applies the mutations still in flight on top of the sessions known by the server.
  applyPending(sessions: Array<ScheduleSession>, fetchers: Array<PendingFetcher>): Array<ScheduleSession> {
    const sessionsById = new Map(sessions.map((session) => [session.id, session]));

    for (const { formData } of fetchers) {
      if (!formData) continue;

      switch (formData.get('intent')) {
        case SESSION_INTENTS.add:
        case SESSION_INTENTS.update: {
          const pending = this.readSession(formData);
          const current = sessionsById.get(pending.id);
          const proposal = current?.proposal?.id === pending.proposal?.id ? current?.proposal : pending.proposal;
          sessionsById.set(pending.id, { ...pending, proposal });
          break;
        }
        case SESSION_INTENTS.switch: {
          const source = sessionsById.get(String(formData.get('sourceId')));
          const target = sessionsById.get(String(formData.get('targetId')));
          if (!source || !target) break;
          sessionsById.set(source.id, {
            ...source,
            trackId: target.trackId,
            timeslot: moveTimeSlotStart(source.timeslot, target.timeslot.start),
          });
          sessionsById.set(target.id, {
            ...target,
            trackId: source.trackId,
            timeslot: moveTimeSlotStart(target.timeslot, source.timeslot.start),
          });
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

  private sessionMutation(intent: SessionIntent, session: ScheduleSession): SessionMutation {
    const formData = new FormData();
    formData.set('intent', intent);
    formData.set('id', session.id);
    formData.set('trackId', session.trackId);
    formData.set('start', this.scheduleTime.toUtc(session.timeslot.start).toISOString());
    formData.set('end', this.scheduleTime.toUtc(session.timeslot.end).toISOString());
    formData.set('color', session.color);
    formData.set('name', session.name ?? '');
    formData.set('language', session.language ?? '');
    formData.set('proposalId', session.proposal?.id ?? '');
    // Snapshot for the pending render only, ignored by the server.
    formData.set('proposalTitle', session.proposal?.title ?? '');
    formData.set('proposalRouteId', session.proposal?.routeId ?? '');
    for (const emoji of session.emojis) {
      formData.append('emojis', emoji);
    }
    return { key: `session:${session.id}`, formData };
  }

  private readSession(formData: FormData): ScheduleSession {
    const proposalId = String(formData.get('proposalId') ?? '');
    return {
      id: String(formData.get('id')),
      trackId: String(formData.get('trackId')),
      timeslot: {
        start: this.scheduleTime.fromUtc(new Date(String(formData.get('start')))),
        end: this.scheduleTime.fromUtc(new Date(String(formData.get('end')))),
      },
      color: String(formData.get('color') ?? 'gray'),
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
}
