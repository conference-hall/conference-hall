import { DataFunctionArgs } from '@remix-run/server-runtime';
import { db } from '../../services/db';
import { requireUserSession } from '../auth/auth.server';

export type TalkFormData = {
  initialValues?: {
    title: string;
    abstract: string;
    references: string | null;
  };
  formats: Array<{ id: string; name: string; description: string | null }>;
  categories: Array<{ id: string; name: string; description: string | null }>;
};

export async function loadTalk({ request, params }: DataFunctionArgs): Promise<TalkFormData> {
  const uid = await requireUserSession(request);

  const talkId = params.talkId;
  let talk;
  if (talkId !== 'new') {
    talk = await db.talk.findFirst({
      select: { title: true, abstract: true, references: true },
      where: { id: talkId, speakers: { some: { id: uid } } },
    });
    if (!talk) {
      throw new Response('Talk not found', { status: 404 });
    }
  }

  const event = await db.event.findUnique({
    select: { formats: true, categories: true },
    where: { slug: params.eventSlug },
  });
  if (!event) {
    throw new Response('Event not found', { status: 404 });
  }

  return {
    initialValues: talk,
    formats: event.formats ?? [],
    categories: event.categories ?? [],
  };
}
