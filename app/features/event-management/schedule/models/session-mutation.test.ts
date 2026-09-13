import { utcToTimezone } from '~/shared/datetimes/timezone.ts';
import type { ScheduleSession } from '../components/schedule.types.ts';
import { SESSION_INTENTS, SessionMutations, toScheduleSession } from './session-mutation.ts';

const TIMEZONE = 'Europe/Paris';

const utc = (hours: number) => new Date(`2024-10-05T${String(hours).padStart(2, '0')}:00:00.000Z`);
const local = (hours: number) => utcToTimezone(utc(hours), TIMEZONE);

const session = (overrides: Partial<ScheduleSession> = {}): ScheduleSession => ({
  id: 'session-1',
  trackId: 'track-1',
  timeslot: { start: local(9), end: local(10) },
  name: 'Break',
  language: 'fr',
  color: 'blue',
  emojis: ['coffee', 'pizza'],
  proposal: null,
  ...overrides,
});

const proposal = { id: 'proposal-1', routeId: '42', title: 'A talk', speakers: [{ name: 'Jane', picture: null }] };

const times = (sessions: Array<ScheduleSession>) =>
  sessions.map((s) => [s.id, s.trackId, s.timeslot.start.getTime(), s.timeslot.end.getTime()]);

describe('SessionMutations', () => {
  const mutations = new SessionMutations(TIMEZONE);

  describe('toScheduleSession', () => {
    it('converts the schedule dates into the schedule timezone', () => {
      const { timeslot, ...rest } = toScheduleSession(
        {
          id: 'session-1',
          trackId: 'track-1',
          start: utc(9),
          end: utc(10),
          name: null,
          language: null,
          color: 'gray',
          emojis: [],
          proposal,
        },
        TIMEZONE,
      );

      expect(rest).toEqual({
        id: 'session-1',
        trackId: 'track-1',
        name: null,
        language: null,
        color: 'gray',
        emojis: [],
        proposal,
      });
      expect(timeslot.start.getTime()).toBe(utc(9).getTime());
      expect(timeslot.start.getHours()).toBe(11);
      expect(timeslot.end.getHours()).toBe(12);
    });
  });

  describe('#add', () => {
    it('encodes the session with a generated id, in UTC', () => {
      const { id, ...newSession } = session({ proposal });

      const { key, formData } = mutations.add(newSession);

      const generatedId = String(formData.get('id'));
      expect(generatedId).not.toBe(id);
      expect(key).toBe(`session:${generatedId}`);
      expect(Object.fromEntries(formData)).toEqual({
        intent: SESSION_INTENTS.add,
        id: generatedId,
        trackId: 'track-1',
        start: '2024-10-05T09:00:00.000Z',
        end: '2024-10-05T10:00:00.000Z',
        color: 'blue',
        name: 'Break',
        language: 'fr',
        proposalId: 'proposal-1',
        proposalTitle: 'A talk',
        proposalRouteId: '42',
        emojis: 'pizza',
      });
      expect(formData.getAll('emojis')).toEqual(['coffee', 'pizza']);
    });

    it('encodes empty values for a session without name, language nor proposal', () => {
      const { formData } = mutations.add(session({ name: null, language: null, proposal: null, emojis: [] }));

      expect(formData.get('name')).toBe('');
      expect(formData.get('language')).toBe('');
      expect(formData.get('proposalId')).toBe('');
      expect(formData.get('proposalTitle')).toBe('');
      expect(formData.getAll('emojis')).toEqual([]);
    });
  });

  describe('#update', () => {
    it('encodes the session with its own id', () => {
      const { key, formData } = mutations.update(session());

      expect(key).toBe('session:session-1');
      expect(formData.get('intent')).toBe(SESSION_INTENTS.update);
      expect(formData.get('id')).toBe('session-1');
      expect(formData.get('start')).toBe('2024-10-05T09:00:00.000Z');
    });
  });

  describe('#switch', () => {
    it('encodes both session ids under the source key', () => {
      const { key, formData } = mutations.switch(session({ id: 'a' }), session({ id: 'b' }));

      expect(key).toBe('session:a');
      expect(Object.fromEntries(formData)).toEqual({ intent: SESSION_INTENTS.switch, sourceId: 'a', targetId: 'b' });
    });
  });

  describe('#delete', () => {
    it('encodes the session id without a key', () => {
      const { key, formData } = mutations.delete(session());

      expect(key).toBeUndefined();
      expect(Object.fromEntries(formData)).toEqual({ intent: SESSION_INTENTS.delete, id: 'session-1' });
    });
  });

  describe('#applyPending', () => {
    it('returns the sessions unchanged without pending mutations', () => {
      const sessions = [session()];

      const actual = mutations.applyPending(sessions, [{}, { formData: new FormData() }]);

      expect(actual).toEqual(sessions);
    });

    it('shows an added session as creating, with a proposal snapshot', () => {
      const { id: _id, ...newSession } = session({ name: null, proposal });
      const { formData } = mutations.add(newSession);

      const [actual] = mutations.applyPending([], [{ formData }]);

      expect(actual).toEqual({
        ...newSession,
        id: String(formData.get('id')),
        isCreating: true,
        proposal: { id: 'proposal-1', title: 'A talk', routeId: '42', speakers: [] },
      });
      expect(times([actual])).toEqual([[actual.id, 'track-1', utc(9).getTime(), utc(10).getTime()]]);
    });

    it('reads empty name and language back as null', () => {
      const { formData } = mutations.add(session({ name: '', language: null }));

      const [actual] = mutations.applyPending([], [{ formData }]);

      expect(actual.name).toBeNull();
      expect(actual.language).toBeNull();
    });

    it('replaces an updated session and keeps its known proposal', () => {
      const current = session({ proposal });
      const { formData } = mutations.update({ ...current, trackId: 'track-2', color: 'red' });

      const [actual] = mutations.applyPending([current], [{ formData }]);

      expect(actual).toEqual({ ...current, trackId: 'track-2', color: 'red', isCreating: false });
    });

    it('uses the proposal snapshot when the update changes the proposal', () => {
      const current = session({ proposal });
      const other = { ...proposal, id: 'proposal-2', title: 'Another talk' };
      const { formData } = mutations.update({ ...current, proposal: other });

      const [actual] = mutations.applyPending([current], [{ formData }]);

      expect(actual.proposal).toEqual({ id: 'proposal-2', title: 'Another talk', routeId: '42', speakers: [] });
    });

    it('swaps track and start of switched sessions, keeping their durations', () => {
      const source = session({ id: 'a', trackId: 'track-1', timeslot: { start: local(9), end: local(10) } });
      const target = session({ id: 'b', trackId: 'track-2', timeslot: { start: local(14), end: local(16) } });
      const { formData } = mutations.switch(source, target);

      const actual = mutations.applyPending([source, target], [{ formData }]);

      expect(times(actual)).toEqual([
        ['a', 'track-2', utc(14).getTime(), utc(15).getTime()],
        ['b', 'track-1', utc(9).getTime(), utc(11).getTime()],
      ]);
    });

    it('ignores a switch with an unknown session', () => {
      const source = session({ id: 'a' });
      const { formData } = mutations.switch(source, session({ id: 'unknown' }));

      const actual = mutations.applyPending([source], [{ formData }]);

      expect(actual).toEqual([source]);
    });

    it('removes a deleted session', () => {
      const deleted = session({ id: 'a' });
      const kept = session({ id: 'b' });
      const { formData } = mutations.delete(deleted);

      const actual = mutations.applyPending([deleted, kept], [{ formData }]);

      expect(actual).toEqual([kept]);
    });
  });
});
