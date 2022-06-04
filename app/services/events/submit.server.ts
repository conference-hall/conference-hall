import { z } from 'zod';
import { db } from '../db';
import { getArray } from '../../utils/form';
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

export type ProposalSaved = { talkId: string };

export async function saveDraftProposalForEvent(talkId: string, eventId: string, uid: string, data: ProposalData) {
  if (talkId !== 'new') {
    const talk = await db.talk.findFirst({ where: { id: talkId, speakers: { some: { id: uid } } } });
    if (!talk) throw new TalkNotFoundError();
  }

  const talk = await db.talk.upsert({
    where: { id: talkId },
    update: { ...data },
    create: {
      ...data,
      creator: { connect: { id: uid } },
      speakers: { connect: [{ id: uid }] },
    },
  });

  await db.proposal.upsert({
    where: { talkId_eventId: { talkId: talk.id, eventId: eventId } },
    update: {
      title: talk.title,
      abstract: talk.abstract,
      level: talk.level,
      references: talk.references,
      languages: talk.languages || [],
      speakers: { set: [], connect: [{ id: uid }] },
    },
    create: {
      title: talk.title,
      abstract: talk.abstract,
      level: talk.level,
      references: talk.references,
      languages: talk.languages || [],
      status: 'DRAFT',
      talk: { connect: { id: talk.id } },
      event: { connect: { id: eventId } },
      speakers: { connect: [{ id: uid }] },
    },
  });

  return { talkId: talk.id };
}

type ProposalData = z.infer<typeof ProposalSchema>;

const ProposalSchema = z.object({
  title: z.string().min(1),
  abstract: z.string().min(1),
  references: z.string().nullable(),
  languages: z.array(z.string()),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable(),
});

export function validateDraftProposalForm(form: FormData) {
  return ProposalSchema.safeParse({
    title: form.get('title'),
    abstract: form.get('abstract'),
    references: form.get('references'),
    level: form.get('level'),
    languages: getArray(form, 'languages'),
  });
}

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
}

export class TalkNotFoundError extends Error {
  constructor() {
    super('Talk not found');
    this.name = 'TalkNotFoundError';
  }
}

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
