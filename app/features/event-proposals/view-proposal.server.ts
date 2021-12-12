import { requireUserSession } from '../auth/auth.server';
import { db } from '../../services/db';
import { LoaderFunction } from 'remix';

export type SpeakerProposal = {
  id: string;
  talkId: string;
  title: string;
  abstract: string;
  status: string;
  level: string | null;
  languages: string | null;
  references: string | null;
  createdAt: string;
  formats: string[];
  categories: string[];
  speakers: Array<{ id: string; name: string | null; photoURL: string | null }>;
};

export const loadSpeakerProposal: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);

  const event = await db.event.findUnique({
    select: { id: true },
    where: { slug: params.eventSlug },
  });
  if (!event) throw new Response('Event not found', { status: 404 });

  const proposal = await db.proposal.findFirst({
    where: {
      speakers: { some: { id: uid } },
      id: params.id,
    },
    include: { speakers: true, formats: true, categories: true },
    orderBy: { createdAt: 'desc' },
  });
  if (!proposal) throw new Response('Proposal not found', { status: 404 });

  return {
    id: proposal.id,
    talkId: proposal.talkId,
    title: proposal.title,
    abstract: proposal.abstract,
    status: proposal.status,
    level: proposal.level,
    languages: proposal.languages,
    references: proposal.references,
    createdAt: proposal.createdAt,
    formats: proposal.formats.map(({ name }) => name),
    categories: proposal.categories.map(({ name }) => name),
    speakers: proposal.speakers.map((speaker) => ({ id: speaker.id, name: speaker.name, photoURL: speaker.photoURL })),
  };
};
