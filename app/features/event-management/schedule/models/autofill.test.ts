import {
  type AutofillPayload,
  type AutofillProposal,
  type AutofillScope,
  type AutofillSession,
  autofill,
  isEligibleProposal,
  vacantSessionCount,
} from './autofill.ts';

const DAY_1 = '2024-10-05';
const DAY_2 = '2024-10-06';

const at = (day: string, hour: number) => new Date(`${day}T${String(hour).padStart(2, '0')}:00:00.000Z`);

type SlotOptions = { day?: string; trackId?: string; hour?: number; minutes?: number };

function vacant(
  id: string,
  { day = DAY_1, trackId = 'track-1', hour = 9, minutes = 60 }: SlotOptions = {},
): AutofillSession {
  return {
    id,
    day,
    trackId,
    start: at(day, hour),
    end: new Date(at(day, hour).getTime() + minutes * 60_000),
    name: null,
    proposalId: null,
    speakerIds: [],
  };
}

function filled(
  id: string,
  proposalId: string,
  options: SlotOptions & { speakerIds?: Array<string> } = {},
): AutofillSession {
  return { ...vacant(id, options), proposalId, speakerIds: options.speakerIds ?? [] };
}

function named(id: string, name: string, options: SlotOptions = {}): AutofillSession {
  return { ...vacant(id, options), name };
}

function proposal(id: string, overrides: Partial<AutofillProposal> = {}): AutofillProposal {
  return {
    id,
    number: 1,
    speakerIds: [],
    deliberationStatus: 'ACCEPTED',
    confirmationStatus: null,
    isDraft: false,
    archivedAt: null,
    formatDurations: [],
    ...overrides,
  };
}

function payloadOf(sessions: Array<AutofillSession>, proposals: Array<AutofillProposal> = []): AutofillPayload {
  return {
    days: [DAY_1, DAY_2],
    tracks: [
      { id: 'track-1', name: 'Room 1' },
      { id: 'track-2', name: 'Room 2' },
    ],
    sessions,
    proposals,
  };
}

function scopeOf(overrides: Partial<AutofillScope> = {}): AutofillScope {
  return {
    days: [DAY_1, DAY_2],
    trackIds: ['track-1', 'track-2'],
    proposalState: 'accepted',
    reset: false,
    rules: { formatDuration: false, speakerRest: null },
    ...overrides,
  };
}

describe('autofill', () => {
  describe('autofill scope', () => {
    it('fills only the sessions of the selected days', () => {
      const payload = payloadOf(
        [vacant('session-1', { day: DAY_1 }), vacant('session-2', { day: DAY_2 })],
        [proposal('proposal-1', { number: 1 }), proposal('proposal-2', { number: 2 })],
      );

      const report = autofill(payload, scopeOf({ days: [DAY_2] }));

      expect(report.assignments).toEqual([{ sessionId: 'session-2', proposalId: 'proposal-1' }]);
      expect(report.sessionsLeftVacant).toEqual([]);
    });

    it('fills only the sessions of the selected tracks', () => {
      const payload = payloadOf(
        [vacant('session-1', { trackId: 'track-1' }), vacant('session-2', { trackId: 'track-2' })],
        [proposal('proposal-1', { number: 1 }), proposal('proposal-2', { number: 2 })],
      );

      const report = autofill(payload, scopeOf({ trackIds: ['track-2'] }));

      expect(report.assignments).toEqual([{ sessionId: 'session-2', proposalId: 'proposal-1' }]);
    });

    it('fills nothing when no day is selected', () => {
      const payload = payloadOf([vacant('session-1')], [proposal('proposal-1')]);

      const report = autofill(payload, scopeOf({ days: [] }));

      expect(report).toEqual({
        assignments: [],
        sessionsLeftVacant: [],
        proposalsLeftUnscheduled: [{ proposalId: 'proposal-1', reason: 'no-vacant-session' }],
        sessionsToClear: [],
      });
    });

    it('fills nothing when no track is selected', () => {
      const payload = payloadOf([vacant('session-1')], [proposal('proposal-1')]);

      const report = autofill(payload, scopeOf({ trackIds: [] }));

      expect(report.assignments).toEqual([]);
      expect(report.sessionsLeftVacant).toEqual([]);
    });

    it('considers only the proposals of the selected state', () => {
      const payload = payloadOf(
        [vacant('session-1')],
        [
          proposal('pending', { number: 1, deliberationStatus: 'PENDING' }),
          proposal('confirmed', { number: 2, confirmationStatus: 'CONFIRMED' }),
        ],
      );

      expect(autofill(payload, scopeOf({ proposalState: 'confirmed' })).assignments).toEqual([
        { sessionId: 'session-1', proposalId: 'confirmed' },
      ]);
      expect(autofill(payload, scopeOf({ proposalState: 'all' })).assignments).toEqual([
        { sessionId: 'session-1', proposalId: 'pending' },
      ]);
    });
  });

  describe('vacant sessions', () => {
    it('never fills a session carrying a name', () => {
      const payload = payloadOf([named('break', 'Lunch break')], [proposal('proposal-1')]);

      const report = autofill(payload, scopeOf());

      expect(report.assignments).toEqual([]);
      expect(report.sessionsLeftVacant).toEqual([]);
      expect(report.proposalsLeftUnscheduled).toEqual([{ proposalId: 'proposal-1', reason: 'no-vacant-session' }]);
    });

    it('never fills a session already carrying a proposal', () => {
      const payload = payloadOf([filled('session-1', 'proposal-9')], [proposal('proposal-1')]);

      const report = autofill(payload, scopeOf());

      expect(report.assignments).toEqual([]);
      expect(report.sessionsLeftVacant).toEqual([]);
    });
  });

  describe('single assignment', () => {
    it('leaves out a proposal already scheduled elsewhere in the schedule', () => {
      const payload = payloadOf(
        [filled('session-1', 'proposal-1', { hour: 9 }), vacant('session-2', { hour: 14 })],
        [proposal('proposal-1', { number: 1 })],
      );

      const report = autofill(payload, scopeOf());

      expect(report.assignments).toEqual([]);
      expect(report.sessionsLeftVacant).toEqual(['session-2']);
      expect(report.proposalsLeftUnscheduled).toEqual([]);
    });

    it('never assigns the same proposal twice in one pass', () => {
      const payload = payloadOf(
        [vacant('session-1', { hour: 9 }), vacant('session-2', { hour: 14 })],
        [proposal('proposal-1', { number: 1 })],
      );

      const report = autofill(payload, scopeOf());

      expect(report.assignments).toEqual([{ sessionId: 'session-1', proposalId: 'proposal-1' }]);
      expect(report.sessionsLeftVacant).toEqual(['session-2']);
    });
  });

  describe('speaker overlap', () => {
    it('never assigns a proposal to a slot overlapping another slot held by one of its speakers', () => {
      const payload = payloadOf(
        [
          filled('session-1', 'proposal-9', { trackId: 'track-1', hour: 9, speakerIds: ['alice'] }),
          vacant('session-2', { trackId: 'track-2', hour: 9 }),
        ],
        [proposal('proposal-1', { number: 1, speakerIds: ['alice'] })],
      );

      const report = autofill(payload, scopeOf());

      expect(report.assignments).toEqual([]);
      expect(report.proposalsLeftUnscheduled).toEqual([{ proposalId: 'proposal-1', reason: 'speaker-overlap' }]);
    });

    it('assigns a proposal to a slot that does not overlap a slot held by its speakers', () => {
      const payload = payloadOf(
        [
          filled('session-1', 'proposal-9', { trackId: 'track-1', hour: 9, speakerIds: ['alice'] }),
          vacant('session-2', { trackId: 'track-2', hour: 14 }),
        ],
        [proposal('proposal-1', { number: 1, speakerIds: ['alice'] })],
      );

      const report = autofill(payload, scopeOf());

      expect(report.assignments).toEqual([{ sessionId: 'session-2', proposalId: 'proposal-1' }]);
    });

    it('reads the sessions outside the scope too', () => {
      const payload = payloadOf(
        [
          filled('session-1', 'proposal-9', { trackId: 'track-1', hour: 9, speakerIds: ['alice'] }),
          vacant('session-2', { trackId: 'track-2', hour: 9 }),
        ],
        [proposal('proposal-1', { number: 1, speakerIds: ['alice'] })],
      );

      const report = autofill(payload, scopeOf({ trackIds: ['track-2'] }));

      expect(report.assignments).toEqual([]);
      expect(report.proposalsLeftUnscheduled).toEqual([{ proposalId: 'proposal-1', reason: 'speaker-overlap' }]);
    });

    it('never schedules a speaker on two overlapping slots filled in the same pass', () => {
      const payload = payloadOf(
        [vacant('session-1', { trackId: 'track-1', hour: 9 }), vacant('session-2', { trackId: 'track-2', hour: 9 })],
        [
          proposal('proposal-1', { number: 1, speakerIds: ['alice'] }),
          proposal('proposal-2', { number: 2, speakerIds: ['alice'] }),
        ],
      );

      const report = autofill(payload, scopeOf());

      expect(report.assignments).toEqual([{ sessionId: 'session-1', proposalId: 'proposal-1' }]);
      expect(report.proposalsLeftUnscheduled).toEqual([{ proposalId: 'proposal-2', reason: 'speaker-overlap' }]);
    });
  });

  describe('format duration', () => {
    const rules = { formatDuration: true, speakerRest: null };

    it('ignores the format durations when the rule is off', () => {
      const payload = payloadOf(
        [vacant('session-1', { minutes: 60 })],
        [proposal('proposal-1', { formatDurations: [20] })],
      );

      expect(autofill(payload, scopeOf()).assignments).toEqual([{ sessionId: 'session-1', proposalId: 'proposal-1' }]);
    });

    it('assigns a proposal only to a session of the duration of its format', () => {
      const payload = payloadOf(
        [vacant('session-1', { hour: 9, minutes: 60 }), vacant('session-2', { hour: 11, minutes: 20 })],
        [proposal('proposal-1', { formatDurations: [20] })],
      );

      const report = autofill(payload, scopeOf({ rules }));

      expect(report.assignments).toEqual([{ sessionId: 'session-2', proposalId: 'proposal-1' }]);
    });

    it('accepts any of the durations of several formats', () => {
      const payload = payloadOf(
        [vacant('session-1', { minutes: 45 })],
        [proposal('proposal-1', { formatDurations: [20, 45] })],
      );

      expect(autofill(payload, scopeOf({ rules })).assignments).toHaveLength(1);
    });

    it('never blocks a proposal without format or with a format without duration', () => {
      const payload = payloadOf(
        [vacant('session-1', { hour: 9, minutes: 60 }), vacant('session-2', { hour: 11, minutes: 60 })],
        [
          proposal('proposal-1', { number: 1, formatDurations: [] }),
          proposal('proposal-2', { number: 2, formatDurations: [20, null] }),
        ],
      );

      expect(autofill(payload, scopeOf({ rules })).assignments).toHaveLength(2);
    });

    it('reports format-duration when no vacant session has the right duration', () => {
      const payload = payloadOf(
        [vacant('session-1', { minutes: 60 })],
        [proposal('proposal-1', { formatDurations: [20] })],
      );

      const report = autofill(payload, scopeOf({ rules }));

      expect(report.assignments).toEqual([]);
      expect(report.proposalsLeftUnscheduled).toEqual([{ proposalId: 'proposal-1', reason: 'format-duration' }]);
    });

    it('reports the rule that blocks the most vacant sessions', () => {
      const payload = payloadOf(
        [
          filled('session-0', 'proposal-0', { hour: 9, speakerIds: ['alice'] }),
          vacant('session-1', { hour: 9, trackId: 'track-2', minutes: 60 }),
          vacant('session-2', { hour: 11, minutes: 60 }),
          vacant('session-3', { hour: 13, minutes: 60 }),
        ],
        [proposal('proposal-1', { speakerIds: ['alice'], formatDurations: [20] })],
      );

      const report = autofill(payload, scopeOf({ rules }));

      expect(report.proposalsLeftUnscheduled).toEqual([{ proposalId: 'proposal-1', reason: 'format-duration' }]);
    });

    it('breaks a tie by rule priority', () => {
      const payload = payloadOf(
        [
          filled('session-0', 'proposal-0', { hour: 9, speakerIds: ['alice'] }),
          vacant('session-1', { hour: 9, trackId: 'track-2', minutes: 60 }),
          vacant('session-2', { hour: 11, minutes: 60 }),
        ],
        [proposal('proposal-1', { speakerIds: ['alice'], formatDurations: [20] })],
      );

      const report = autofill(payload, scopeOf({ rules }));

      expect(report.proposalsLeftUnscheduled).toEqual([{ proposalId: 'proposal-1', reason: 'speaker-overlap' }]);
    });
  });

  describe('most constrained proposal first', () => {
    const slots = [vacant('session-1', { hour: 9, minutes: 20 }), vacant('session-2', { hour: 11, minutes: 60 })];
    const proposals = [
      proposal('proposal-1', { number: 1, formatDurations: [] }),
      proposal('proposal-2', { number: 2, formatDurations: [20] }),
    ];

    it('keeps a flexible proposal from taking the session a single-duration proposal needs', () => {
      const report = autofill(
        payloadOf(slots, proposals),
        scopeOf({ rules: { formatDuration: true, speakerRest: null } }),
      );

      expect(report.assignments).toEqual([
        { sessionId: 'session-1', proposalId: 'proposal-2' },
        { sessionId: 'session-2', proposalId: 'proposal-1' },
      ]);
      expect(report.proposalsLeftUnscheduled).toEqual([]);
    });

    it('keeps the proposal number order without the format duration rule', () => {
      const report = autofill(payloadOf(slots, proposals), scopeOf());

      expect(report.assignments).toEqual([
        { sessionId: 'session-1', proposalId: 'proposal-1' },
        { sessionId: 'session-2', proposalId: 'proposal-2' },
      ]);
    });

    it('counts the vacant sessions of the scope only, after the reset', () => {
      const payload = payloadOf(
        [
          vacant('session-1', { hour: 9, minutes: 20 }),
          vacant('session-2', { hour: 11, minutes: 20, day: DAY_2 }),
          vacant('session-3', { hour: 13, minutes: 60 }),
        ],
        [
          proposal('proposal-1', { number: 1, formatDurations: [20, 60] }),
          proposal('proposal-2', { number: 2, formatDurations: [20, 60] }),
          proposal('proposal-3', { number: 3, formatDurations: [60] }),
        ],
      );

      const report = autofill(payload, scopeOf({ days: [DAY_1], rules: { formatDuration: true, speakerRest: null } }));

      expect(report.assignments).toEqual([
        { sessionId: 'session-1', proposalId: 'proposal-1' },
        { sessionId: 'session-3', proposalId: 'proposal-3' },
      ]);
    });
  });

  describe('speaker rest', () => {
    const rules = { formatDuration: false, speakerRest: 30 as const };

    it('is off by default', () => {
      const payload = payloadOf(
        [filled('session-1', 'proposal-9', { hour: 9, speakerIds: ['alice'] }), vacant('session-2', { hour: 10 })],
        [proposal('proposal-1', { speakerIds: ['alice'] })],
      );

      expect(autofill(payload, scopeOf()).assignments).toHaveLength(1);
    });

    it('rejects a session starting less than the rest after a session of the speaker', () => {
      const payload = payloadOf(
        [
          filled('session-1', 'proposal-9', { hour: 9, speakerIds: ['alice'] }),
          { ...vacant('session-2', { hour: 10 }), start: new Date(at(DAY_1, 10).getTime() + 29 * 60_000) },
        ],
        [proposal('proposal-1', { speakerIds: ['alice'] })],
      );

      const report = autofill(payload, scopeOf({ rules }));

      expect(report.assignments).toEqual([]);
      expect(report.proposalsLeftUnscheduled).toEqual([{ proposalId: 'proposal-1', reason: 'speaker-rest' }]);
    });

    it('accepts a gap equal to the rest', () => {
      const payload = payloadOf(
        [
          filled('session-1', 'proposal-9', { hour: 9, speakerIds: ['alice'] }),
          { ...vacant('session-2', { hour: 10 }), start: new Date(at(DAY_1, 10).getTime() + 30 * 60_000) },
        ],
        [proposal('proposal-1', { speakerIds: ['alice'] })],
      );

      expect(autofill(payload, scopeOf({ rules })).assignments).toHaveLength(1);
    });

    it('rejects a session ending too close before a session of the speaker', () => {
      const payload = payloadOf(
        [filled('session-1', 'proposal-9', { hour: 10, speakerIds: ['alice'] }), vacant('session-2', { hour: 9 })],
        [proposal('proposal-1', { speakerIds: ['alice'] })],
      );

      const report = autofill(payload, scopeOf({ rules }));

      expect(report.proposalsLeftUnscheduled).toEqual([{ proposalId: 'proposal-1', reason: 'speaker-rest' }]);
    });

    it('applies across tracks and days', () => {
      const payload = payloadOf(
        [
          filled('session-1', 'proposal-9', { day: DAY_1, hour: 23, speakerIds: ['alice'] }),
          { ...vacant('session-2', { day: DAY_2, trackId: 'track-2', hour: 0 }), start: at(DAY_2, 0) },
        ],
        [proposal('proposal-1', { speakerIds: ['alice'] })],
      );

      const report = autofill(payload, scopeOf({ rules: { formatDuration: false, speakerRest: 15 } }));

      expect(report.proposalsLeftUnscheduled).toEqual([{ proposalId: 'proposal-1', reason: 'speaker-rest' }]);
    });

    it('reads co-speakers and the sessions outside the scope', () => {
      const payload = payloadOf(
        [
          filled('session-1', 'proposal-9', { trackId: 'track-1', hour: 9, speakerIds: ['alice', 'bob'] }),
          vacant('session-2', { trackId: 'track-2', hour: 10 }),
        ],
        [proposal('proposal-1', { speakerIds: ['bob', 'carol'] })],
      );

      const report = autofill(payload, scopeOf({ trackIds: ['track-2'], rules: { ...rules, speakerRest: 60 } }));

      expect(report.proposalsLeftUnscheduled).toEqual([{ proposalId: 'proposal-1', reason: 'speaker-rest' }]);
    });

    it('ignores a named session without proposal', () => {
      const payload = payloadOf(
        [named('session-1', 'Lunch', { hour: 9 }), vacant('session-2', { hour: 10 })],
        [proposal('proposal-1', { speakerIds: ['alice'] })],
      );

      expect(autofill(payload, scopeOf({ rules })).assignments).toHaveLength(1);
    });

    it('keeps the rest between two assignments made in the same pass', () => {
      const payload = payloadOf(
        [vacant('session-1', { hour: 9 }), vacant('session-2', { hour: 10 }), vacant('session-3', { hour: 12 })],
        [
          proposal('proposal-1', { number: 1, speakerIds: ['alice'] }),
          proposal('proposal-2', { number: 2, speakerIds: ['alice'] }),
        ],
      );

      const report = autofill(payload, scopeOf({ rules: { ...rules, speakerRest: 60 } }));

      expect(report.assignments).toEqual([
        { sessionId: 'session-1', proposalId: 'proposal-1' },
        { sessionId: 'session-3', proposalId: 'proposal-2' },
      ]);
    });

    it('ranks speaker overlap before speaker rest on a tie', () => {
      const payload = payloadOf(
        [
          filled('session-0', 'proposal-0', { hour: 9, speakerIds: ['alice'] }),
          vacant('session-1', { trackId: 'track-2', hour: 9 }),
          vacant('session-2', { hour: 10 }),
        ],
        [proposal('proposal-1', { speakerIds: ['alice'] })],
      );

      const report = autofill(payload, scopeOf({ rules }));

      expect(report.proposalsLeftUnscheduled).toEqual([{ proposalId: 'proposal-1', reason: 'speaker-overlap' }]);
    });

    it('ranks format duration before speaker rest on a tie', () => {
      const payload = payloadOf(
        [
          filled('session-0', 'proposal-0', { hour: 9, speakerIds: ['alice'] }),
          vacant('session-1', { hour: 12, minutes: 60 }),
          vacant('session-2', { hour: 10, minutes: 20 }),
        ],
        [proposal('proposal-1', { speakerIds: ['alice'], formatDurations: [20] })],
      );

      const report = autofill(payload, scopeOf({ rules: { formatDuration: true, speakerRest: 60 } }));

      expect(report.proposalsLeftUnscheduled).toEqual([{ proposalId: 'proposal-1', reason: 'format-duration' }]);
    });
  });

  describe('determinism', () => {
    it('returns the same report for two calls on the same inputs', () => {
      const payload = payloadOf(
        [
          vacant('session-1', { trackId: 'track-1', hour: 9 }),
          vacant('session-2', { trackId: 'track-2', hour: 9 }),
          vacant('session-3', { trackId: 'track-1', hour: 14 }),
        ],
        [
          proposal('proposal-1', { number: 3, speakerIds: ['alice'] }),
          proposal('proposal-2', { number: 1, speakerIds: ['alice', 'bob'] }),
          proposal('proposal-3', { number: null, speakerIds: ['carol'] }),
          proposal('proposal-4', { number: 2, speakerIds: ['bob'] }),
        ],
      );

      expect(autofill(payload, scopeOf())).toEqual(autofill(payload, scopeOf()));
    });
  });

  describe('autofill reset', () => {
    it('clears the filled sessions of the scope', () => {
      const payload = payloadOf(
        [filled('session-1', 'proposal-9', { speakerIds: ['alice'] }), vacant('session-2', { hour: 14 })],
        [],
      );

      const report = autofill(payload, scopeOf({ reset: true }));

      expect(report.sessionsToClear).toEqual(['session-1']);
    });

    it('never clears a session carrying a name', () => {
      const payload = payloadOf([named('break', 'Lunch break')], []);

      const report = autofill(payload, scopeOf({ reset: true }));

      expect(report.sessionsToClear).toEqual([]);
    });

    it('never clears a session outside the scope', () => {
      const payload = payloadOf(
        [filled('session-1', 'proposal-9', { day: DAY_1 }), filled('session-2', 'proposal-8', { day: DAY_2 })],
        [],
      );

      const report = autofill(payload, scopeOf({ days: [DAY_2], reset: true }));

      expect(report.sessionsToClear).toEqual(['session-2']);
    });

    it('refills a cleared session in the same pass with the proposal it released', () => {
      const payload = payloadOf(
        [filled('session-1', 'proposal-1', { speakerIds: ['alice'] })],
        [proposal('proposal-1', { number: 1, speakerIds: ['alice'] })],
      );

      const report = autofill(payload, scopeOf({ reset: true }));

      expect(report.sessionsToClear).toEqual(['session-1']);
      expect(report.assignments).toEqual([{ sessionId: 'session-1', proposalId: 'proposal-1' }]);
    });

    it('leaves the filled sessions alone when reset is off', () => {
      const payload = payloadOf([filled('session-1', 'proposal-1')], [proposal('proposal-1')]);

      const report = autofill(payload, scopeOf());

      expect(report.sessionsToClear).toEqual([]);
      expect(report.assignments).toEqual([]);
    });
  });

  describe('autofill report', () => {
    it('lists the vacant sessions left vacant', () => {
      const payload = payloadOf(
        [vacant('session-1', { hour: 9 }), vacant('session-2', { hour: 14 })],
        [proposal('proposal-1', { number: 1 })],
      );

      const report = autofill(payload, scopeOf());

      expect(report.sessionsLeftVacant).toEqual(['session-2']);
    });

    it('reports a proposal with no vacant session left as no-vacant-session', () => {
      const payload = payloadOf(
        [vacant('session-1')],
        [proposal('proposal-1', { number: 1 }), proposal('proposal-2', { number: 2 })],
      );

      const report = autofill(payload, scopeOf());

      expect(report.proposalsLeftUnscheduled).toEqual([{ proposalId: 'proposal-2', reason: 'no-vacant-session' }]);
    });

    it('reports sessions left vacant and proposals set aside for speaker overlap at the same time', () => {
      const payload = payloadOf(
        [vacant('session-1', { trackId: 'track-1', hour: 9 }), vacant('session-2', { trackId: 'track-2', hour: 9 })],
        [
          proposal('proposal-1', { number: 1, speakerIds: ['alice'] }),
          proposal('proposal-2', { number: 2, speakerIds: ['alice'] }),
        ],
      );

      const report = autofill(payload, scopeOf());

      expect(report.sessionsLeftVacant).toEqual(['session-2']);
      expect(report.proposalsLeftUnscheduled).toEqual([{ proposalId: 'proposal-2', reason: 'speaker-overlap' }]);
    });
  });

  describe('vacantSessionCount', () => {
    it('counts the vacant sessions of the scope', () => {
      const payload = payloadOf([
        vacant('session-1', { trackId: 'track-1', hour: 9 }),
        vacant('session-2', { trackId: 'track-1', hour: 14 }),
        vacant('session-3', { trackId: 'track-2', hour: 9 }),
        named('break', 'Lunch break', { trackId: 'track-1', hour: 12 }),
      ]);

      expect(vacantSessionCount(payload, scopeOf({ trackIds: ['track-1'] }))).toBe(2);
    });

    it('counts the filled sessions of the scope too when reset is on', () => {
      const payload = payloadOf([
        vacant('session-1', { trackId: 'track-1', hour: 9 }),
        filled('session-2', 'proposal-9', { trackId: 'track-1', hour: 14 }),
      ]);

      expect(vacantSessionCount(payload, scopeOf({ trackIds: ['track-1'] }))).toBe(1);
      expect(vacantSessionCount(payload, scopeOf({ trackIds: ['track-1'], reset: true }))).toBe(2);
    });

    it('counts only the days of the scope', () => {
      const payload = payloadOf([vacant('session-1', { day: DAY_1 }), vacant('session-2', { day: DAY_2 })]);

      expect(vacantSessionCount(payload, scopeOf({ days: [DAY_1] }))).toBe(1);
    });
  });
});

describe('isEligibleProposal', () => {
  it('keeps a proposal in deliberation for the "all" state, despite its null confirmation status', () => {
    const inDeliberation = proposal('proposal-1', { deliberationStatus: 'PENDING', confirmationStatus: null });

    expect(isEligibleProposal(inDeliberation, 'all')).toBe(true);
    expect(isEligibleProposal(inDeliberation, 'accepted')).toBe(false);
    expect(isEligibleProposal(inDeliberation, 'confirmed')).toBe(false);
  });

  it('keeps an accepted proposal not yet confirmed for the "accepted" state', () => {
    const accepted = proposal('proposal-1', { deliberationStatus: 'ACCEPTED', confirmationStatus: 'PENDING' });

    expect(isEligibleProposal(accepted, 'all')).toBe(true);
    expect(isEligibleProposal(accepted, 'accepted')).toBe(true);
    expect(isEligibleProposal(accepted, 'confirmed')).toBe(false);
  });

  it('keeps a confirmed proposal for the three states', () => {
    const confirmed = proposal('proposal-1', { deliberationStatus: 'ACCEPTED', confirmationStatus: 'CONFIRMED' });

    expect(isEligibleProposal(confirmed, 'all')).toBe(true);
    expect(isEligibleProposal(confirmed, 'accepted')).toBe(true);
    expect(isEligibleProposal(confirmed, 'confirmed')).toBe(true);
  });

  it('rejects a rejected, declined, draft or archived proposal whatever the state', () => {
    const rejected = proposal('proposal-1', { deliberationStatus: 'REJECTED' });
    const declined = proposal('proposal-2', { confirmationStatus: 'DECLINED' });
    const draft = proposal('proposal-3', { isDraft: true });
    const archived = proposal('proposal-4', { archivedAt: new Date('2024-10-01') });

    for (const state of ['all', 'accepted', 'confirmed'] as const) {
      expect(isEligibleProposal(rejected, state)).toBe(false);
      expect(isEligibleProposal(declined, state)).toBe(false);
      expect(isEligibleProposal(draft, state)).toBe(false);
      expect(isEligibleProposal(archived, state)).toBe(false);
    }
  });
});
