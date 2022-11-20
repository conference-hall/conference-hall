import { db } from '../db';
import { ProposalNotFoundError } from '../errors';

export async function getSubmittedProposal(talkId: string, eventId: string, uid: string) {
  const proposal = await db.proposal.findFirst({
    select: { title: true, formats: true, categories: true, speakers: true },
    where: { talkId, eventId, speakers: { some: { id: uid } } },
  });
  if (!proposal) throw new ProposalNotFoundError();

  return {
    title: proposal.title,
    speakers: proposal.speakers.map((s) => ({
      name: s.name,
      photoURL: s.photoURL,
    })),
    formats: proposal.formats.map((f) => ({ id: f.id, name: f.name })),
    categories: proposal.categories.map((c) => ({ id: c.id, name: c.name })),
  };
}
