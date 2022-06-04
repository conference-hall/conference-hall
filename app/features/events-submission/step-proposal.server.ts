import { z } from 'zod';
import { db } from '../../services/db';
import { getArray } from '../../utils/form';

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

export function validateProposalForm(form: FormData) {
  return ProposalSchema.safeParse({
    title: form.get('title'),
    abstract: form.get('abstract'),
    references: form.get('references'),
    level: form.get('level'),
    languages: getArray(form, 'languages'),
  });
}

export class TalkNotFoundError extends Error {
  constructor() {
    super('Proposal not found');
    this.name = 'TalkNotFoundError';
  }
}