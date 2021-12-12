import { ActionFunction, LoaderFunction, redirect } from 'remix';
import { z } from 'zod';
import { db } from '../../services/db';
import { requireUserSession } from '../auth/auth.server';

export type TracksData = {
  formats: Array<{ id: string; name: string; description: string | null }>;
  categories: Array<{ id: string; name: string; description: string | null }>;
  initialValues: {
    formats: string[];
    categories: string[];
  };
};

export const loadTracks: LoaderFunction = async ({ request, params }) => {
  const { talkId, eventSlug } = params;
  if (!talkId) throw new Response('Talk id is required', { status: 400 });

  const event = await db.event.findUnique({
    select: { id: true, formats: true, categories: true },
    where: { slug: eventSlug },
  });
  if (!event) throw new Response('Event not found', { status: 404 });

  const proposal = await db.proposal.findUnique({
    select: { formats: true, categories: true },
    where: { talkId_eventId: { talkId, eventId: event.id } },
  });
  if (!proposal) throw new Response('Proposal not found', { status: 404 });

  return {
    formats: event.formats ?? [],
    categories: event.categories ?? [],
    initialValues: {
      formats: proposal.formats.map((f) => f.id),
      categories: proposal.categories.map((c) => c.id),
    },
  };
};

export const saveTracks: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const { eventSlug, talkId } = params;

  const event = await db.event.findUnique({ where: { slug: eventSlug } });
  if (!event) throw new Response('Event not found', { status: 404 });

  const form = await request.formData();
  const result = validateTracks(form, event.formatsRequired, event.categoriesRequired);
  if (!result.success) {
    return result.error.flatten();
  }

  const talk = await db.talk.findFirst({ where: { id: talkId, speakers: { some: { id: uid } } } });
  if (!talk) throw new Response('Not your talk!', { status: 401 });

  const { formats, categories } = result.data;
  await db.proposal.update({
    where: { talkId_eventId: { talkId: talk.id, eventId: event.id } },
    data: {
      formats: { set: [], connect: formats?.map((f) => ({ id: f })) },
      categories: { set: [], connect: categories?.map((c) => ({ id: c })) },
    },
  });

  if (event.surveyEnabled) {
    return redirect(`/${eventSlug}/submission/${talk.id}/survey`);
  }
  return redirect(`/${eventSlug}/submission/${talk.id}/submit`);
};

export function validateTracks(form: FormData, formatsRequired: boolean, categoriesRequired: boolean) {
  const TracksSchema = z.object({
    formats: z.array(z.string()),
    categories: z.array(z.string()),
  }).refine((data: any) => (formatsRequired ? Boolean(data.formats?.length) : true), {
    message: 'Formats are required',
    path: ['formats'],
  }).refine((data: any) => (categoriesRequired ? Boolean(data.categories?.length) : true), {
    message: 'Categories are required',
    path: ['categories'],
  });

  return TracksSchema.safeParse({
    formats: form.getAll('formats'),
    categories: form.getAll('categories'),
  })
}
