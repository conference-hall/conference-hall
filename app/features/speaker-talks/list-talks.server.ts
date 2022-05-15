import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireUserSession } from '../auth/auth.server';
import { db } from '../../services/db';

export type SpeakerTalks = Array<{
  id: string;
  title: string;
  createdAt: string;
  speakers: Array<{ id: string; name: string | null; photoURL: string | null }>;
}>;

export const loadSpeakerTalks: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);

  const talks = await db.talk.findMany({
    select: { id: true, title: true, createdAt: true, speakers: true },
    where: {
      speakers: { some: { id: uid } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return json<SpeakerTalks>(
    talks.map((proposal) => ({
      id: proposal.id,
      title: proposal.title,
      createdAt: proposal.createdAt.toISOString(),
      speakers: proposal.speakers.map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        photoURL: speaker.photoURL,
      })),
    }))
  );
};
