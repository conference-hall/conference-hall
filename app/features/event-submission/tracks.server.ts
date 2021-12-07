import { ActionFunction, LoaderFunction, redirect } from 'remix';
import { db } from '../../services/db';
import { requireUserSession } from '../auth/auth.server';
import { validate } from './validation/tracks-validation';

export type TracksData = {
  formats: Array<{ id: string; name: string; description: string | null }>;
  categories: Array<{ id: string; name: string; description: string | null }>;
};

export const loadTracks: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);

  const talk = await db.talk.findFirst({
    select: { title: true, abstract: true, references: true, level: true },
    where: { id: params.talkId, speakers: { some: { id: uid } } },
  });
  if (!talk) throw new Response('Talk not found', { status: 404 });

  const event = await db.event.findUnique({
    select: { formats: true, categories: true },
    where: { slug: params.eventSlug },
  });
  if (!event) throw new Response('Event not found', { status: 404 });

  return {
    formats: event.formats ?? [],
    categories: event.categories ?? [],
  };
}

export const saveTracks: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const { eventSlug, talkId } = params;

  const event = await db.event.findUnique({ where: { slug: eventSlug } });
  if (!event) throw new Response('Event not found', { status: 404 });

  const form = await request.formData();
  const result = validate(form, {
    isFormatsRequired: event.formatsRequired,
    isCategoriesRequired: event.categoriesRequired,
  });
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

