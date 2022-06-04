import { db } from '../../services/db';
import { getCfpState } from '../../utils/event';

export type TalksToSubmit = Array<{
  id: string;
  title: string;
  isDraft: boolean;
  speakers: Array<{ id: string; name: string | null; photoURL: string | null }>;
}>;

export async function fetchTalksToSubmitForEvent(uid: string, slug: string): Promise<TalksToSubmit> {
  const event = await db.event.findUnique({
    select: { id: true, type: true, cfpStart: true, cfpEnd: true },
    where: { slug },
  });
  if (!event) throw new EventNotFoundError();

  const isCfpOpen = getCfpState(event.type, event.cfpStart, event.cfpEnd) === 'OPENED';
  if (!isCfpOpen) throw new CfpNotOpenError();

  const talks = await db.talk.findMany({
    select: {
      id: true,
      title: true,
      speakers: true,
      proposals: {
        select: { id: true },
        where: { eventId: event.id, status: 'DRAFT' },
      },
    },
    where: {
      speakers: { some: { id: uid } },
      archived: false,
      OR: [
        { proposals: { none: { eventId: event.id } } },
        { proposals: { some: { eventId: event.id, status: 'DRAFT' } } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  return talks.map((talk) => ({
    id: talk.id,
    title: talk.title,
    isDraft: talk.proposals.length > 0,
    speakers: talk.speakers.map((speaker) => ({ id: speaker.id, name: speaker.name, photoURL: speaker.photoURL })),
  }));
}

export type ProposalCountsForEvent = {
  max: number | null;
  submitted: number;
};

export async function getProposalCountsForEvent(uid: string, slug: string): Promise<ProposalCountsForEvent> {
  const event = await db.event.findUnique({
    select: { id: true, maxProposals: true },
    where: { slug },
  });
  if (!event) throw new EventNotFoundError();

  const submittedProposals = await db.proposal.count({
    where: {
      eventId: event.id,
      speakers: { some: { id: uid } },
      status: { not: { equals: 'DRAFT' } },
    },
  });

  return {
    max: event.maxProposals,
    submitted: submittedProposals,
  };
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
