import { areTimeSlotsOverlapping } from '~/shared/datetimes/timeslots.ts';

// The three nested values of the Proposal state selector: Confirmed ⊆ Accepted ⊆ All.
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
};

export type AutofillProposal = {
  id: string;
  number: number | null;
  speakerIds: Array<string>;
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

// Bounds what the autofill writes, never what an Assignment rule reads.
export type AutofillScope = {
  days: Array<string>;
  trackIds: Array<string>;
  proposalState: ProposalState;
  reset: boolean;
};

type AutofillAssignment = { sessionId: string; proposalId: string };

export type AutofillReport = {
  assignments: Array<AutofillAssignment>;
  sessionsLeftVacant: Array<string>;
  proposalsLeftUnscheduled: Array<{ proposalId: string; reason: AutofillReason }>;
  sessionsToClear: Array<string>;
};

// What an Assignment rule sees: the strict minimum, never a field loaded for a future rule.
type RuleProposal = { id: string; number: number | null; speakerIds: Array<string> };

type RuleSession = { id: string; trackId: string; trackOrder: number; start: Date; end: Date };

type RuleContext = {
  occupancy: Array<{ speakerIds: Array<string>; start: Date; end: Date }>;
  assignedProposalIds: Set<string>;
};

type AssignmentRule = {
  id: string;
  evaluate: (proposal: RuleProposal, session: RuleSession, context: RuleContext) => boolean;
};

// A rejection reason is the id of the blocking rule, so adding a rule adds its reason.
const NO_VACANT_SESSION = 'no-vacant-session';

const ASSIGNMENT_RULES = [
  {
    id: 'speaker-overlap',
    evaluate: (proposal, session, context) =>
      !context.occupancy.some(
        (busy) =>
          areTimeSlotsOverlapping(session, busy) && busy.speakerIds.some((id) => proposal.speakerIds.includes(id)),
      ),
  },
] as const satisfies ReadonlyArray<AssignmentRule>;

export type AutofillReason = typeof NO_VACANT_SESSION | (typeof ASSIGNMENT_RULES)[number]['id'];

// A Proposal eligible for the given state. `confirmationStatus` is NULL for every Proposal still in
// deliberation, so "different from DECLINED" is written as an explicit comparison and never in SQL.
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

// How many Vacant sessions the scope holds, the Autofill reset included. Shares its derivation with
// the autofill itself, so the per-track counters of the panel describe the very same operation.
export function vacantSessionCount(payload: AutofillPayload, scope: AutofillScope): number {
  return workingState(payload, scope).vacantSessions.length;
}

// Assigns Proposals to the Vacant sessions of the scope. Never writes: the caller does.
export function autofill(payload: AutofillPayload, scope: AutofillScope): AutofillReport {
  const { sessions, vacantSessions, sessionsToClear } = workingState(payload, scope);

  // `Single assignment`, upstream half: a Proposal already scheduled is not a candidate, and does not
  // show up among the Proposals left unscheduled either.
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

  const accepts = (proposal: AutofillProposal, session: RuleSession) =>
    ASSIGNMENT_RULES.every((rule) => rule.evaluate(proposal, session, context));

  const assignments: Array<AutofillAssignment> = [];
  for (const session of vacantSessions) {
    // `Single assignment`, downstream half: the Set carried by the context.
    const picked = eligibleProposals.find(
      (proposal) => !context.assignedProposalIds.has(proposal.id) && accepts(proposal, session),
    );
    if (!picked) continue;

    assignments.push({ sessionId: session.id, proposalId: picked.id });
    context.assignedProposalIds.add(picked.id);
    context.occupancy.push({ speakerIds: picked.speakerIds, start: session.start, end: session.end });
  }

  // The reason is judged on the final state, never per candidate pair: in a greedy pass a rejection
  // depends on the walking order. A session passing every rule means another Proposal took it.
  const reasonFor = (proposal: AutofillProposal): AutofillReason => {
    if (vacantSessions.some((session) => accepts(proposal, session))) return NO_VACANT_SESSION;
    const blocking = ASSIGNMENT_RULES.find((rule) =>
      vacantSessions.some((session) => !rule.evaluate(proposal, session, context)),
    );
    return blocking ? blocking.id : NO_VACANT_SESSION;
  };

  const proposalsLeftUnscheduled = eligibleProposals
    .filter((proposal) => !context.assignedProposalIds.has(proposal.id))
    .map((proposal) => ({ proposalId: proposal.id, reason: reasonFor(proposal) }));

  const filledSessionIds = new Set(assignments.map((assignment) => assignment.sessionId));
  const sessionsLeftVacant = vacantSessions
    .filter((session) => !filledSessionIds.has(session.id))
    .map((session) => session.id);

  return { assignments, sessionsLeftVacant, proposalsLeftUnscheduled, sessionsToClear };
}

type WorkingSession = AutofillSession & { trackOrder: number };

// The Schedule as the autofill sees it: the whole Schedule, with the Autofill reset already applied.
function workingState(payload: AutofillPayload, scope: AutofillScope) {
  const trackOrders = new Map(payload.tracks.map((track, index) => [track.id, index]));
  const days = new Set(scope.days);
  const trackIds = new Set(scope.trackIds);
  const inScope = (session: AutofillSession) => days.has(session.day) && trackIds.has(session.trackId);

  const sessionsToClear = scope.reset
    ? payload.sessions.filter((session) => inScope(session) && session.proposalId && !session.name).map((s) => s.id)
    : [];
  const cleared = new Set(sessionsToClear);

  const sessions: Array<WorkingSession> = payload.sessions.map((session) => ({
    ...session,
    trackOrder: trackOrders.get(session.trackId) ?? payload.tracks.length,
    proposalId: cleared.has(session.id) ? null : session.proposalId,
    speakerIds: cleared.has(session.id) ? [] : session.speakerIds,
  }));

  const vacantSessions = sessions
    .filter((session) => inScope(session) && !session.proposalId && !session.name)
    .toSorted(bySessionOrder);

  return { sessions, vacantSessions, sessionsToClear };
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
