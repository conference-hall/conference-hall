import { db } from '../../services/db';

export type SpeakerProposals = Array<{
  id: string;
  title: string;
  talkId: string | null;
  status: string;
  createdAt: string;
  speakers: Array<{ id: string; name: string | null; photoURL: string | null }>;
}>;

export async function fetchSpeakerProposals(slug: string, uid: string) {
  const proposals = await db.proposal.findMany({
    select: { id: true, title: true, talkId: true, status: true, createdAt: true, speakers: true },
    where: {
      speakers: { some: { id: uid } },
      event: { slug },
    },
    orderBy: { createdAt: 'desc' },
  });

  return proposals.map((proposal) => ({
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
  }));
}
