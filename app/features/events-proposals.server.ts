import { ActionFunction, redirect } from '@remix-run/node';
import { z } from 'zod';
import { db } from '../services/db';
import { getCfpState } from '../utils/event';
import { getArray } from '../utils/form';
import { jsonToArray } from '../utils/prisma';
import { requireUserSession } from './auth.server';

export type SpeakerProposals = Array<{
  id: string;
  title: string;
  talkId: string | null;
  status: string;
  createdAt: string;
  speakers: Array<{ id: string; name: string | null; photoURL: string | null }>;
}>;

export async function fetchSpeakerProposals(slug: string, uid: string) {
  const proposals = await db.proposal.findMany({
    select: { id: true, title: true, talkId: true, status: true, createdAt: true, speakers: true },
    where: {
      speakers: { some: { id: uid } },
      event: { slug },
    },
    orderBy: { createdAt: 'desc' },
  });

  return proposals.map((proposal) => ({
    id: proposal.id,
    title: proposal.title,
    talkId: proposal.talkId,
    status: proposal.status,
    createdAt: proposal.createdAt.toISOString(),
    speakers: proposal.speakers.map((speaker) => ({
      id: speaker.id,
      name: speaker.name,
      photoURL: speaker.photoURL,
    })),
  }));
}

export type SpeakerProposal = {
  id: string;
  talkId: string | null;
  title: string;
  abstract: string;
  status: string;
  level: string | null;
  references: string | null;
  createdAt: string;
  languages: string[];
  formats: string[];
  categories: string[];
  speakers: Array<{ id: string; name: string | null; photoURL: string | null }>;
};

export async function getSpeakerProposal(proposalId: string, uid: string) {
  const proposal = await db.proposal.findFirst({
    where: {
      speakers: { some: { id: uid } },
      id: proposalId,
    },
    include: { speakers: true, formats: true, categories: true },
    orderBy: { createdAt: 'desc' },
  });
  if (!proposal) throw new ProposalNotFoundError();

  return {
    id: proposal.id,
    talkId: proposal.talkId,
    title: proposal.title,
    abstract: proposal.abstract,
    status: proposal.status,
    level: proposal.level,
    references: proposal.references,
    createdAt: proposal.createdAt.toISOString(),
    languages: jsonToArray(proposal.languages),
    formats: proposal.formats.map(({ name }) => name),
    categories: proposal.categories.map(({ name }) => name),
    speakers: proposal.speakers.map((speaker) => ({ id: speaker.id, name: speaker.name, photoURL: speaker.photoURL })),
  };
}

export type EventFormatsAndCategories = {
  formats: Array<{ id: string; name: string; description: string | null }>;
  categories: Array<{ id: string; name: string; description: string | null }>;
};

export async function getEventFormatsAndCategories(slug: string) {
  const event = await db.event.findUnique({
    select: { id: true, formats: true, categories: true },
    where: { slug },
  });
  if (!event) throw new EventNotFoundError();
  return {
    formats: event.formats ?? [],
    categories: event.categories ?? [],
  };
}

export async function deleteProposal(proposalId: string, uid: string) {
  await db.proposal.deleteMany({ where: { id: proposalId, speakers: { some: { id: uid } } } });
}

export async function updateProposal(slug: string, proposalId: string, uid: string, data: ProposalData) {
  const event = await db.event.findUnique({
    select: { id: true, type: true, cfpStart: true, cfpEnd: true },
    where: { slug },
  });
  if (!event) throw new EventNotFoundError();

  const isCfpOpen = getCfpState(event.type, event.cfpStart, event.cfpEnd) === 'OPENED';
  if (!isCfpOpen) throw new CfpNotOpenError();

  const proposal = await db.proposal.findFirst({
    where: { id: proposalId, speakers: { some: { id: uid } } },
  });
  if (!proposal) throw new ProposalNotFoundError();

  const { formats, categories, ...talk } = data;

  await db.proposal.update({
    where: { id: proposalId },
    data: {
      ...talk,
      speakers: { set: [], connect: [{ id: uid }] },
      formats: { set: [], connect: formats.map((id) => ({ id })) },
      categories: { set: [], connect: categories.map((id) => ({ id })) },
    },
  });

  if (proposal.talkId) {
    await db.talk.update({
      where: { id: proposal.talkId },
      data: talk,
    });
  }
}

type ProposalData = z.infer<typeof ProposalSchema>;

const ProposalSchema = z.object({
  title: z.string().min(1),
  abstract: z.string().min(1),
  references: z.string().nullable(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable(),
  languages: z.array(z.string()),
  formats: z.array(z.string()),
  categories: z.array(z.string()),
});

export function validateProposalForm(form: FormData) {
  return ProposalSchema.safeParse({
    title: form.get('title'),
    abstract: form.get('abstract'),
    references: form.get('references'),
    level: form.get('level'),
    formats: form.getAll('formats'),
    categories: form.getAll('categories'),
    languages: getArray(form, 'languages'),
  });
}

export class EventNotFoundError extends Error {
  constructor() {
    super('Event not found');
    this.name = 'EventNotFoundError';
  }
}

export class ProposalNotFoundError extends Error {
  constructor() {
    super('Proposal not found');
    this.name = 'ProposalNotFoundError';
  }
}

export class CfpNotOpenError extends Error {
  constructor() {
    super('CFP not open');
    this.name = 'CfpNotOpenError';
  }
}
