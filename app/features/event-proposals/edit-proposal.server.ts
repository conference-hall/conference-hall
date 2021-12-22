import { ActionFunction, json, LoaderFunction, redirect } from 'remix';
import { z } from 'zod';
import { requireUserSession } from '../auth/auth.server';
import { db } from '../../services/db';
import { jsonToArray } from '../../utils/prisma';

export type SpeakerEditProposal = {
  proposal: {
    id: string;
    talkId: string | null;
    title: string;
    abstract: string;
    status: string;
    level: string | null;
    language: string | null;
    references: string | null;
    createdAt: string;
    formats: string[];
    categories: string[];
    speakers: Array<{ id: string; name: string | null; photoURL: string | null }>;
  };
  formats: Array<{ id: string; name: string; description: string | null }>;
  categories: Array<{ id: string; name: string; description: string | null }>;
};

export const loadSpeakerEditProposal: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);

  const event = await db.event.findUnique({
    select: { id: true, formats: true, categories: true },
    where: { slug: params.eventSlug },
  });
  if (!event) throw new Response('Event not found.', { status: 404 });

  const proposal = await db.proposal.findFirst({
    where: {
      speakers: { some: { id: uid } },
      id: params.id,
    },
    include: { speakers: true, formats: true, categories: true },
    orderBy: { createdAt: 'desc' },
  });
  if (!proposal) throw new Response('Proposal not found.', { status: 404 });

  const languages = jsonToArray(proposal.languages);

  return json<SpeakerEditProposal>({
    proposal: {
      id: proposal.id,
      talkId: proposal.talkId,
      title: proposal.title,
      abstract: proposal.abstract,
      status: proposal.status,
      level: proposal.level,
      language: languages.length > 0 ? languages[0] : null,
      references: proposal.references,
      createdAt: proposal.createdAt.toISOString(),
      formats: proposal.formats.map(({ id }) => id),
      categories: proposal.categories.map(({ id }) => id),
      speakers: proposal.speakers.map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        photoURL: speaker.photoURL,
      })),
    },
    formats: event.formats ?? [],
    categories: event.categories ?? [],
  });
};

export const editProposal: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const { eventSlug, id } = params;

  const event = await db.event.findUnique({
    select: { id: true, formatsRequired: true, categoriesRequired: true },
    where: { slug: eventSlug },
  });
  if (!event) throw new Response('Event not found.', { status: 404 });

  // TODO Check if CFP is open

  const form = await request.formData();
  const result = validateProposalForm(form, event.formatsRequired, event.categoriesRequired);
  if (!result.success) {
    return result.error.flatten();
  }

  const proposal = await db.proposal.findFirst({
    where: { id, speakers: { some: { id: uid } } },
  });
  if (!proposal) throw new Response('Proposal not found.', { status: 404 });

  const { formats, categories, ...talk } = result.data;

  await db.proposal.update({
    where: { id },
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

  return redirect(`/${eventSlug}/proposals/${id}`);
};

export function validateProposalForm(form: FormData, formatsRequired: boolean, categoriesRequired: boolean) {
  const ProposalSchema = z
    .object({
      title: z.string().nonempty(),
      abstract: z.string().nonempty(),
      references: z.string().nullable(),
      level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable(),
      languages: z.array(z.string()),
      formats: z.array(z.string()),
      categories: z.array(z.string()),
    })
    .refine((data: any) => (formatsRequired ? Boolean(data.formats?.length) : true), {
      message: 'Formats are required',
      path: ['formats'],
    })
    .refine((data: any) => (categoriesRequired ? Boolean(data.categories?.length) : true), {
      message: 'Categories are required',
      path: ['categories'],
    });

  return ProposalSchema.safeParse({
    title: form.get('title'),
    abstract: form.get('abstract'),
    references: form.get('references'),
    level: form.get('level'),
    languages: form.get('language') ? [form.get('language')] : [],
    formats: form.getAll('formats'),
    categories: form.getAll('categories'),
  });
}
