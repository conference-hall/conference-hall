import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { z } from 'zod';
import { db } from '../../services/db';
import { jsonToArray } from '../../utils/prisma';
import { requireUserSession } from '../auth/auth.server';

export type ProposalData = {
  title: string;
  abstract: string;
  references: string | null;
  language: string | null;
  level: string | null;
} | null;

export const loadProposal: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);

  const talkId = params.talkId;
  let talk = null;
  if (talkId !== 'new') {
    talk = await db.talk.findFirst({
      select: { title: true, abstract: true, references: true, level: true, languages: true },
      where: { id: talkId, speakers: { some: { id: uid } } },
    });
    if (!talk) {
      throw new Response('Proposal not found.', { status: 404 });
    }
  }

  if (!talk) return null;
  
  const languages = jsonToArray(talk.languages)

  return json<ProposalData>({
    title: talk.title,
    abstract: talk.abstract,
    references: talk.references,
    language: languages.length > 0 ? languages[0] : null,
    level: talk.level,
  });
}

export const saveProposal: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const { eventSlug, talkId } = params;

  const form = await request.formData();
  const result = validateProposal(form)
  if (!result.success) {
    console.error(result.error.flatten());
    return result.error.flatten();
  }

  const event = await db.event.findUnique({
    select: { id: true, formats: true, categories: true, surveyEnabled: true },
    where: { slug: eventSlug },
  });
  if (!event) throw new Response('Event not found.', { status: 404 });

  if (talkId !== 'new') {
    const talk = await db.talk.findFirst({ where: { id: talkId, speakers: { some: { id: uid } } } });
    if (!talk) throw new Response('Not your proposal!', { status: 401 });
  }

  const talk = await db.talk.upsert({
    where: { id: talkId },
    update: { ...result.data },
    create: {
      ...result.data,
      creator: { connect: { id: uid } },
      speakers: { connect: [{ id: uid }] },
    },
  });

  await db.proposal.upsert({
    where: { talkId_eventId: { talkId: talk.id, eventId: event.id } },
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
      event: { connect: { id: event.id } },
      speakers: { connect: [{ id: uid }] },
    },
  });

  if (!!event.formats.length || !!event.categories.length) {
    return redirect(`/${eventSlug}/submission/${talk.id}/tracks`);
  }
  if (event.surveyEnabled) {
    return redirect(`/${eventSlug}/submission/${talk.id}/survey`);
  }
  return redirect(`/${eventSlug}/submission/${talk.id}/submit`);
};

export function validateProposal(form: FormData) {
  const ProposalSchema = z.object({
    title: z.string().nonempty(),
    abstract: z.string().nonempty(),
    references: z.string().nullable(),
    languages: z.array(z.string()),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable(),
  });

  return ProposalSchema.safeParse({
    title: form.get('title'),
    abstract: form.get('abstract'),
    references: form.get('references'),
    languages: form.get('language') ? [form.get('language')] : [],
    level: form.get('level'),
  })
}
