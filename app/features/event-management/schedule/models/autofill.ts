import { areTimeSlotsOverlapping } from '~/shared/datetimes/timeslots.ts';

export type ProposalState = 'all' | 'accepted' | 'confirmed';

export const PROPOSAL_STATES: Array<ProposalState> = ['all', 'accepted', 'confirmed'];

type AutofillTrack = { id: string; name: string };

export type AutofillSession = {
  id: string;
  day: string;
  trackId: string;
  start: Date;
  end: Date;
  name: string | null;
  proposalId: string | null;
  speakerIds: Array<string>;
  locked: boolean;
};

export type AutofillProposal = {
  id: string;
  number: number | null;
  speakerIds: Array<string>;
  formatDurations: Array<number | null>;
  deliberationStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  confirmationStatus: 'PENDING' | 'CONFIRMED' | 'DECLINED' | null;
  isDraft: boolean;
  archivedAt: Date | null;
};

export type AutofillPayload = {
  days: Array<string>;
  tracks: Array<AutofillTrack>;
  sessions: Array<AutofillSession>;
  proposals: Array<AutofillProposal>;
};

export type AutofillScope = {
  days: Array<string>;
  trackIds: Array<string>;
  proposalState: ProposalState;
  reset: boolean;
  rules: AutofillRules;
};

export const SPEAKER_REST_MINUTES = [15, 30, 60, 120] as const;
export type SpeakerRestMinutes = (typeof SPEAKER_REST_MINUTES)[number];

type AutofillRules = { formatDuration: boolean; speakerRest: SpeakerRestMinutes | null };
type AutofillAssignment = { sessionId: string; proposalId: string };

export type AutofillReport = {
  assignments: Array<AutofillAssignment>;
  sessionsLeftVacant: Array<string>;
  proposalsLeftUnscheduled: Array<{ proposalId: string; reason: AutofillReason }>;
  sessionsToClear: Array<string>;
  sessionsLocked: number;
};

type RuleProposal = { id: string; speakerIds: Array<string>; formatDurations: Array<number | null> };

type RuleSession = { id: string; start: Date; end: Date };

type RuleContext = {
  occupancy: Array<{ speakerIds: Array<string>; start: Date; end: Date }>;
  assignedProposalIds: Set<string>;
};

type AssignmentRule = {
  id: 'speaker-overlap' | 'format-duration' | 'speaker-rest';
  evaluate: (proposal: RuleProposal, session: RuleSession, context: RuleContext) => boolean;
};

const NO_VACANT_SESSION = 'no-vacant-session';

const MINUTE = 60_000;

const sharesSpeaker = (proposal: RuleProposal, busy: { speakerIds: Array<string> }) =>
  busy.speakerIds.some((id) => proposal.speakerIds.includes(id));

const speakerOverlap: AssignmentRule = {
  id: 'speaker-overlap',
  evaluate: (proposal, session, context) =>
    !context.occupancy.some((busy) => areTimeSlotsOverlapping(session, busy) && sharesSpeaker(proposal, busy)),
};

const hasUnknownFormatDuration = ({ formatDurations }: RuleProposal) =>
  formatDurations.length === 0 || formatDurations.some((duration) => duration === null);

const formatDuration: AssignmentRule = {
  id: 'format-duration',
  evaluate: (proposal, session) => {
    const durations = proposal.formatDurations;
    if (hasUnknownFormatDuration(proposal)) return true;
    return durations.includes((session.end.getTime() - session.start.getTime()) / MINUTE);
  },
};

const speakerRest = (minutes: number): AssignmentRule => ({
  id: 'speaker-rest',
  evaluate: (proposal, session, context) =>
    !context.occupancy.some((busy) => {
      if (!sharesSpeaker(proposal, busy)) return false;
      const gap = Math.max(session.start.getTime() - busy.end.getTime(), busy.start.getTime() - session.end.getTime());
      return gap < minutes * MINUTE;
    }),
});

// The order is the priority of the reasons.
function activeRules(rules: AutofillRules): Array<AssignmentRule> {
  return [
    speakerOverlap,
    ...(rules.formatDuration ? [formatDuration] : []),
    ...(rules.speakerRest ? [speakerRest(rules.speakerRest)] : []),
  ];
}

export type AutofillReason = typeof NO_VACANT_SESSION | AssignmentRule['id'];

export function isEligibleProposal(proposal: AutofillProposal, state: ProposalState): boolean {
  if (proposal.isDraft || proposal.archivedAt) return false;
  if (proposal.confirmationStatus === 'DECLINED') return false;

  switch (state) {
    case 'confirmed':
      return proposal.deliberationStatus === 'ACCEPTED' && proposal.confirmationStatus === 'CONFIRMED';
    case 'accepted':
      return proposal.deliberationStatus === 'ACCEPTED';
    case 'all':
      return proposal.deliberationStatus === 'PENDING' || proposal.deliberationStatus === 'ACCEPTED';
  }
}

export function proposalsWithoutFormatDuration(payload: AutofillPayload, state: ProposalState): number {
  return payload.proposals.filter(
    (proposal) => isEligibleProposal(proposal, state) && hasUnknownFormatDuration(proposal),
  ).length;
}

export function vacantSessionCount(payload: AutofillPayload, scope: AutofillScope): number {
  return workingState(payload, scope).vacantSessions.length;
}

// Assigns Proposals to the Vacant sessions of the scope. Never writes: the caller does.
export function autofill(payload: AutofillPayload, scope: AutofillScope): AutofillReport {
  const { sessions, vacantSessions, sessionsToClear, sessionsLocked } = workingState(payload, scope);

  const scheduledProposalIds = new Set(sessions.filter((s) => s.proposalId).map((s) => s.proposalId));

  const eligibleProposals = payload.proposals
    .filter((proposal) => isEligibleProposal(proposal, scope.proposalState))
    .filter((proposal) => !scheduledProposalIds.has(proposal.id))
    .toSorted(byProposalOrder);

  const context: RuleContext = {
    occupancy: sessions
      .filter((session) => session.proposalId)
      .map(({ speakerIds, start, end }) => ({ speakerIds, start, end })),
    assignedProposalIds: new Set<string>(),
  };

  const rules = activeRules(scope.rules);
  const accepts = (proposal: AutofillProposal, session: RuleSession) =>
    rules.every((rule) => rule.evaluate(proposal, session, context));

  // Vacant sessions a Proposal fits whatever the occupancy: the fewer, the more constrained.
  const noOccupancy: RuleContext = { occupancy: [], assignedProposalIds: new Set() };
  const degrees = new Map(
    eligibleProposals.map((proposal) => [
      proposal.id,
      vacantSessions.filter((session) => rules.every((rule) => rule.evaluate(proposal, session, noOccupancy))).length,
    ]),
  );
  const byDegree = (a: AutofillProposal, b: AutofillProposal) =>
    (degrees.get(a.id) ?? 0) - (degrees.get(b.id) ?? 0) || byProposalOrder(a, b);

  const assignments: Array<AutofillAssignment> = [];
  for (const session of vacantSessions) {
    const picked = eligibleProposals
      .filter((proposal) => !context.assignedProposalIds.has(proposal.id) && accepts(proposal, session))
      .reduce<AutofillProposal | undefined>(
        (best, proposal) => (best && byDegree(best, proposal) <= 0 ? best : proposal),
        undefined,
      );
    if (!picked) continue;

    assignments.push({ sessionId: session.id, proposalId: picked.id });
    context.assignedProposalIds.add(picked.id);
    context.occupancy.push({ speakerIds: picked.speakerIds, start: session.start, end: session.end });
  }

  // Each Vacant session counts for its first blocking rule; the most frequent rule wins, ties go to priority.
  const reasonFor = (proposal: AutofillProposal): AutofillReason => {
    const counts = new Map<AutofillReason, number>();
    for (const session of vacantSessions) {
      const blocking = rules.find((rule) => !rule.evaluate(proposal, session, context));
      if (!blocking) return NO_VACANT_SESSION;
      counts.set(blocking.id, (counts.get(blocking.id) ?? 0) + 1);
    }
    let reason: AutofillReason = NO_VACANT_SESSION;
    let best = 0;
    for (const rule of rules) {
      const count = counts.get(rule.id) ?? 0;
      if (count > best) [reason, best] = [rule.id, count];
    }
    return reason;
  };

  const proposalsLeftUnscheduled = eligibleProposals
    .filter((proposal) => !context.assignedProposalIds.has(proposal.id))
    .map((proposal) => ({ proposalId: proposal.id, reason: reasonFor(proposal) }));

  const filledSessionIds = new Set(assignments.map((assignment) => assignment.sessionId));
  const sessionsLeftVacant = vacantSessions
    .filter((session) => !filledSessionIds.has(session.id))
    .map((session) => session.id);

  return { assignments, sessionsLeftVacant, proposalsLeftUnscheduled, sessionsToClear, sessionsLocked };
}

type WorkingSession = AutofillSession & { trackOrder: number };

// The Schedule as the autofill sees it: the whole Schedule, with the Autofill reset already applied.
function workingState(payload: AutofillPayload, scope: AutofillScope) {
  const trackOrders = new Map(payload.tracks.map((track, index) => [track.id, index]));
  const days = new Set(scope.days);
  const trackIds = new Set(scope.trackIds);
  const inScope = (session: AutofillSession) => days.has(session.day) && trackIds.has(session.trackId);

  const sessionsLocked = payload.sessions.filter((session) => inScope(session) && session.locked).length;
  const sessionsToClear = scope.reset
    ? payload.sessions
        .filter((session) => inScope(session) && !session.locked && session.proposalId && !session.name)
        .map((s) => s.id)
    : [];
  const cleared = new Set(sessionsToClear);

  const sessions: Array<WorkingSession> = payload.sessions.map((session) => ({
    ...session,
    trackOrder: trackOrders.get(session.trackId) ?? payload.tracks.length,
    proposalId: cleared.has(session.id) ? null : session.proposalId,
    speakerIds: cleared.has(session.id) ? [] : session.speakerIds,
  }));

  const vacantSessions = sessions
    .filter((session) => inScope(session) && !session.locked && !session.proposalId && !session.name)
    .toSorted(bySessionOrder);

  return { sessions, vacantSessions, sessionsToClear, sessionsLocked };
}

function bySessionOrder(a: WorkingSession, b: WorkingSession) {
  return a.start.getTime() - b.start.getTime() || a.trackOrder - b.trackOrder || a.id.localeCompare(b.id);
}

function byProposalOrder(a: AutofillProposal, b: AutofillProposal) {
  if (a.number !== b.number) {
    if (a.number === null) return 1;
    if (b.number === null) return -1;
    return a.number - b.number;
  }
  return a.id.localeCompare(b.id);
}
