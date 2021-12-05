import { DataFunctionArgs } from '@remix-run/server-runtime';
import { requireAuthUserId } from '../auth/auth.server';
import { db } from '../../services/db';

export type TalkSelectionStep = Array<{
  id: string;
  title: string;
  speakers: Array<{ id: string; name: string | null; photoURL: string | null }>;
}>;

export async function loadTalksSelection({ request }: DataFunctionArgs): Promise<TalkSelectionStep> {
  const uid = await requireAuthUserId(request);
  const talks = await db.talk.findMany({
    select: { id: true, title: true, speakers: true },
    where: { speakers: { some: { id: uid } } },
    orderBy: { createdAt: 'desc' },
  });

  return talks.map((talk) => ({
    id: talk.id,
    title: talk.title,
    speakers: talk.speakers.map((speaker) => ({ id: speaker.id, name: speaker.name, photoURL: speaker.photoURL })),
  }));
}
