import { requireAuthUserId } from '../auth/auth.server';
import { db } from '../../services/db';
import { LoaderFunction } from 'remix';

export type TalkSelectionStep = Array<{
  id: string;
  title: string;
  isDraft: boolean;
  speakers: Array<{ id: string; name: string | null; photoURL: string | null }>;
}>;

export const loadTalksSelection: LoaderFunction = async ({ request, params }) => {
  const uid = await requireAuthUserId(request);

  const event = await db.event.findUnique({
    select: { id: true, maxProposals: true },
    where: { slug: params.eventSlug },
  });
  if (!event) throw new Response('Event not found', { status: 404 });

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
};
