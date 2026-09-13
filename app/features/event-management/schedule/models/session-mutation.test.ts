import type { ScheduleSession, SessionData } from '../components/schedule.types.ts';
import { ScheduleTime } from './schedule-time.ts';
import { pendingSessions, SESSION_INTENTS, type SessionMutation, SessionMutations } from './session-mutation.ts';
import { SessionPlacement } from './session-placement.ts';

const scheduleTime = new ScheduleTime('Europe/Paris');

const utc = (hours: number, minutes = 0) =>
  new Date(`2024-10-05T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`);
const local = (hours: number, minutes = 0) => scheduleTime.fromUtc(utc(hours, minutes));

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

const sessionData = (overrides: Partial<SessionData> = {}): SessionData => ({
  id: 'session-1',
  trackId: 'track-1',
  start: utc(9),
  end: utc(10),
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
  let submitted: Array<SessionMutation>;
  const submit = async (mutation: SessionMutation) => {
    submitted.push(mutation);
  };
  const mutations = (sessions: Array<ScheduleSession> = []) => new SessionMutations(sessions, { scheduleTime, submit });

  beforeEach(() => {
    submitted = [];
  });

  describe('#add', () => {
    it('submits the session with a generated id, in UTC', async () => {
      const { id, ...newSession } = session({ proposal });

      const outcome = await mutations().add(newSession);

      expect(outcome.status).toBe('placed');
      const [{ key, formData }] = submitted;
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

    it('submits empty values for a session without name, language nor proposal', async () => {
      await mutations().add(session({ name: null, language: null, proposal: null, emojis: [] }));

      const [{ formData }] = submitted;
      expect(formData.get('name')).toBe('');
      expect(formData.get('language')).toBe('');
      expect(formData.get('proposalId')).toBe('');
      expect(formData.get('proposalTitle')).toBe('');
      expect(formData.getAll('emojis')).toEqual([]);
    });

    it('refuses a session overlapping another session of the track without submitting', async () => {
      const other = session({ id: 'other', timeslot: { start: local(9), end: local(11) } });

      const outcome = await mutations([other]).add(session({ timeslot: { start: local(10), end: local(12) } }));

      expect(outcome).toEqual({ status: 'conflict', conflictingSession: other });
      expect(submitted).toEqual([]);
    });
  });

  describe('#update', () => {
    it('submits the session with its own id', async () => {
      const current = session();

      const outcome = await mutations([current]).update({ ...current, color: 'red' });

      expect(outcome.status).toBe('placed');
      const [{ key, formData }] = submitted;
      expect(key).toBe('session:session-1');
      expect(formData.get('intent')).toBe(SESSION_INTENTS.update);
      expect(formData.get('id')).toBe('session-1');
      expect(formData.get('color')).toBe('red');
      expect(formData.get('start')).toBe('2024-10-05T09:00:00.000Z');
    });

    it('refuses a session overlapping another session of the track without submitting', async () => {
      const current = session();
      const other = session({ id: 'other', timeslot: { start: local(11), end: local(12) } });

      const outcome = await mutations([current, other]).update({
        ...current,
        timeslot: { start: local(10), end: local(12) },
      });

      expect(outcome).toEqual({ status: 'conflict', conflictingSession: other });
      expect(submitted).toEqual([]);
    });
  });

  describe('#move', () => {
    it('submits the session at its adjusted place', async () => {
      const moved = session({ timeslot: { start: local(9), end: local(11) } });
      const next = session({ id: 'next', trackId: 'track-2', timeslot: { start: local(12), end: local(13) } });

      const outcome = await mutations([moved, next]).move(moved, { trackId: 'track-2', start: local(11) });

      expect(outcome.status).toBe('adjusted');
      const [{ key, formData }] = submitted;
      expect(key).toBe('session:session-1');
      expect(formData.get('intent')).toBe(SESSION_INTENTS.update);
      expect(formData.get('trackId')).toBe('track-2');
      expect(formData.get('start')).toBe('2024-10-05T11:00:00.000Z');
      expect(formData.get('end')).toBe('2024-10-05T12:00:00.000Z');
    });

    it('refuses a move onto a taken start without submitting', async () => {
      const moved = session();
      const blocking = session({ id: 'blocking', trackId: 'track-2', timeslot: { start: local(11), end: local(13) } });

      const outcome = await mutations([moved, blocking]).move(moved, { trackId: 'track-2', start: local(12) });

      expect(outcome).toEqual({ status: 'conflict', conflictingSession: blocking });
      expect(submitted).toEqual([]);
    });
  });

  describe('#resize', () => {
    it('submits the clamped end', async () => {
      const resized = session();
      const next = session({ id: 'next', timeslot: { start: local(11), end: local(12) } });

      const outcome = await mutations([resized, next]).resize(resized, local(14));

      expect(outcome.status).toBe('adjusted');
      const [{ formData }] = submitted;
      expect(formData.get('start')).toBe('2024-10-05T09:00:00.000Z');
      expect(formData.get('end')).toBe('2024-10-05T11:00:00.000Z');
    });

    it('refuses a resize from a taken start without submitting', async () => {
      const resized = session();
      const blocking = session({ id: 'blocking', timeslot: { start: local(9), end: local(10) } });

      const outcome = await mutations([resized, blocking]).resize(resized, local(12));

      expect(outcome).toEqual({ status: 'conflict', conflictingSession: blocking });
      expect(submitted).toEqual([]);
    });
  });

  describe('#swap', () => {
    it('submits both session ids under the source key', async () => {
      const source = session({ id: 'a' });
      const target = session({ id: 'b', trackId: 'track-2', timeslot: { start: local(14), end: local(15) } });

      const outcome = await mutations([source, target]).swap(source, target);

      expect(outcome.status).toBe('placed');
      const [{ key, formData }] = submitted;
      expect(key).toBe('session:a');
      expect(Object.fromEntries(formData)).toEqual({ intent: SESSION_INTENTS.switch, sourceId: 'a', targetId: 'b' });
    });

    it('refuses a swap overlapping a neighbour without submitting', async () => {
      const source = session({ id: 'a' });
      const target = session({ id: 'b', trackId: 'track-2', timeslot: { start: local(14), end: local(16) } });
      const neighbour = session({ id: 'c', timeslot: { start: local(10, 30), end: local(12) } });

      const outcome = await mutations([source, target, neighbour]).swap(source, target);

      expect(outcome).toEqual({ status: 'conflict', conflictingSession: neighbour });
      expect(submitted).toEqual([]);
    });
  });

  describe('#delete', () => {
    it('submits the session id without a key', async () => {
      await mutations([session()]).delete(session());

      const [{ key, formData }] = submitted;
      expect(key).toBeUndefined();
      expect(Object.fromEntries(formData)).toEqual({ intent: SESSION_INTENTS.delete, id: 'session-1' });
    });
  });

  describe('.blank', () => {
    it('builds a stone session with empty fields', () => {
      const timeslot = { start: local(9), end: local(9, 30) };

      const blank = SessionMutations.blank({ trackId: 'track-1', timeslot });

      expect(blank).toEqual({
        id: 'new',
        trackId: 'track-1',
        timeslot,
        name: '',
        language: null,
        color: 'stone',
        emojis: [],
        proposal: null,
      });
    });
  });
});

describe('pendingSessions', () => {
  let submitted: Array<SessionMutation>;
  const submit = async (mutation: SessionMutation) => {
    submitted.push(mutation);
  };
  const mutations = new SessionMutations([], { scheduleTime, submit });

  beforeEach(() => {
    submitted = [];
  });

  it('converts the loaded sessions into schedule time without pending mutations', () => {
    const actual = pendingSessions([sessionData({ proposal })], [{}, { formData: new FormData() }], scheduleTime);

    expect(actual).toEqual([session({ proposal })]);
    expect(actual[0].timeslot.start.getHours()).toBe(11);
  });

  it('shows an added session as creating, with a proposal snapshot', async () => {
    const { id: _id, ...newSession } = session({ name: null, proposal });
    await mutations.add(newSession);
    const [{ formData }] = submitted;

    const [actual] = pendingSessions([], [{ formData }], scheduleTime);

    expect(actual).toEqual({
      ...newSession,
      id: String(formData.get('id')),
      isCreating: true,
      proposal: { id: 'proposal-1', title: 'A talk', routeId: '42', speakers: [] },
    });
    expect(times([actual])).toEqual([[actual.id, 'track-1', utc(9).getTime(), utc(10).getTime()]]);
  });

  it('reads empty name and language back as null', async () => {
    await mutations.add(session({ name: '', language: null }));
    const [{ formData }] = submitted;

    const [actual] = pendingSessions([], [{ formData }], scheduleTime);

    expect(actual.name).toBeNull();
    expect(actual.language).toBeNull();
  });

  it('replaces an updated session and keeps its known proposal', async () => {
    const current = session({ proposal });
    await mutations.update({ ...current, trackId: 'track-2', color: 'red' });
    const [{ formData }] = submitted;

    const [actual] = pendingSessions([sessionData({ proposal })], [{ formData }], scheduleTime);

    expect(actual).toEqual({ ...current, trackId: 'track-2', color: 'red', isCreating: false });
  });

  it('uses the proposal snapshot when the update changes the proposal', async () => {
    const other = { ...proposal, id: 'proposal-2', title: 'Another talk' };
    await mutations.update(session({ proposal: other }));
    const [{ formData }] = submitted;

    const [actual] = pendingSessions([sessionData({ proposal })], [{ formData }], scheduleTime);

    expect(actual.proposal).toEqual({ id: 'proposal-2', title: 'Another talk', routeId: '42', speakers: [] });
  });

  it('swaps the sessions as the placement rule does', async () => {
    const source = session({ id: 'a' });
    const target = session({ id: 'b', trackId: 'track-2', timeslot: { start: local(14), end: local(16) } });
    await mutations.swap(source, target);
    const [{ formData }] = submitted;

    const actual = pendingSessions(
      [sessionData({ id: 'a' }), sessionData({ id: 'b', trackId: 'track-2', start: utc(14), end: utc(16) })],
      [{ formData }],
      scheduleTime,
    );

    const [a, b] = actual;
    expect(new SessionPlacement([source, target]).swap(source, target)).toEqual({
      status: 'placed',
      source: { trackId: a.trackId, timeslot: a.timeslot },
      target: { trackId: b.trackId, timeslot: b.timeslot },
    });
    expect(times(actual)).toEqual([
      ['a', 'track-2', utc(14).getTime(), utc(15).getTime()],
      ['b', 'track-1', utc(9).getTime(), utc(11).getTime()],
    ]);
  });

  it('ignores a swap with an unknown session', async () => {
    await mutations.swap(
      session({ id: 'a' }),
      session({ id: 'unknown', timeslot: { start: local(14), end: local(15) } }),
    );
    const [{ formData }] = submitted;

    const actual = pendingSessions([sessionData({ id: 'a' })], [{ formData }], scheduleTime);

    expect(actual).toEqual([session({ id: 'a' })]);
  });

  it('removes a deleted session', async () => {
    await mutations.delete(session({ id: 'a' }));
    const [{ formData }] = submitted;

    const actual = pendingSessions([sessionData({ id: 'a' }), sessionData({ id: 'b' })], [{ formData }], scheduleTime);

    expect(actual).toEqual([session({ id: 'b' })]);
  });
});
