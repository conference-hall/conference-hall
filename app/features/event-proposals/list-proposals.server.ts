import { requireUserSession } from '../auth/auth.server';
import { db } from '../../services/db';
import { json, LoaderFunction } from 'remix';

export type SpeakerProposals = Array<{
  id: string;
  title: string;
  talkId: string | null;
  status: string;
  createdAt: string;
  speakers: Array<{ id: string; name: string | null; photoURL: string | null }>;
}>;

export const loadSpeakerProposals: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);

  const event = await db.event.findUnique({
    select: { id: true },
    where: { slug: params.eventSlug },
  });
  if (!event) throw new Response('Event not found', { status: 404 });

  const proposals = await db.proposal.findMany({
    select: { id: true, title: true, talkId: true, status: true, createdAt: true, speakers: true },
    where: {
      speakers: { some: { id: uid } },
      eventId: event.id,
    },
    orderBy: { createdAt: 'desc' },
  });

  return json<SpeakerProposals>(
    proposals.map((proposal) => ({
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
    }))
  );
};
