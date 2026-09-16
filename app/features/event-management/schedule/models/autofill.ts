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

export function vacantSessionCount(payload: AutofillPayload, scope: AutofillScope): number {
  return workingState(payload, scope).vacantSessions.length;
}

// Assigns Proposals to the Vacant sessions of the scope. Never writes: the caller does.
export function autofill(payload: AutofillPayload, scope: AutofillScope): AutofillReport {
  const { sessions, vacantSessions, sessionsToClear } = workingState(payload, scope);

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
    const picked = eligibleProposals.find(
      (proposal) => !context.assignedProposalIds.has(proposal.id) && accepts(proposal, session),
    );
    if (!picked) continue;

    assignments.push({ sessionId: session.id, proposalId: picked.id });
    context.assignedProposalIds.add(picked.id);
    context.occupancy.push({ speakerIds: picked.speakerIds, start: session.start, end: session.end });
  }

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
