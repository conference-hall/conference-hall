import { db } from '../../services/db';
import { getCfpState } from '../../utils/event';

export type ProposalInfo = {
  title: string;
  speakers: Array<{ name: string | null; photoURL: string | null }>;
  formats: string[];
  categories: string[];
};

export async function getProposalInfo(talkId: string, eventId: string, uid: string): Promise<ProposalInfo> {
  const proposal = await db.proposal.findFirst({
    select: { title: true, formats: true, categories: true, speakers: true },
    where: { talkId, eventId, speakers: { some: { id: uid } } },
  });
  if (!proposal) throw new ProposalNotFoundError();

  return {
    title: proposal.title,
    speakers: proposal.speakers.map((s) => ({ name: s.name, photoURL: s.photoURL })),
    formats: proposal.formats.map((f) => f.name),
    categories: proposal.categories.map((c) => c.name),
  };
}

export async function submitProposal(talkId: string, eventSlug: string, uid: string) {
  const event = await db.event.findUnique({
    select: { id: true, type: true, cfpStart: true, cfpEnd: true, maxProposals: true },
    where: { slug: eventSlug },
  });
  if (!event) throw new EventNotFoundError();

  const isCfpOpen = getCfpState(event.type, event.cfpStart, event.cfpEnd) === 'OPENED';
  if (!isCfpOpen) throw new CfpNotOpenError();

  if (event.maxProposals) {
    const nbProposals = await db.proposal.count({
      where: {
        eventId: event.id,
        speakers: { some: { id: uid } },
        status: { not: { equals: 'DRAFT' } },
        id: { not: { equals: talkId } },
      },
    });
    if (nbProposals >= event.maxProposals) {
      throw new MaxSubmittedProposalsReachedError();
    }
  }

  const result = await db.proposal.updateMany({
    data: { status: 'SUBMITTED' },
    where: { talkId, eventId: event.id, speakers: { some: { id: uid } } },
  });
  if (result.count === 0) throw new ProposalNotFoundError();

  // TODO Email notification to speakers
  // TODO Email notification to organizers
  // TODO Slack notification
};

export class ProposalNotFoundError extends Error {
  constructor() {
    super('Proposal not found');
    this.name = 'ProposalNotFoundError';
  }
}

export class EventNotFoundError extends Error {
  constructor() {
    super('Event not found');
    this.name = 'EventNotFoundError';
  }
}

export class CfpNotOpenError extends Error {
  constructor() {
    super('CFP not open');
    this.name = 'CfpNotOpenError';
  }
}

export class MaxSubmittedProposalsReachedError extends Error {
  constructor() {
    super('You have reached the maximum number of proposals.');
    this.name = 'MaxSubmittedProposalsReachedError';
  }
}

export class ProposalSubmissionError extends Error {
  constructor() {
    super('Error while submitting proposal');
    this.name = 'ProposalSubmissionError';
  }
}