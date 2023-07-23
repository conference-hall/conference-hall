import { db } from '~/libs/db';
import { getSpeakerProposalStatus } from '~/routes/__server/proposals/get-speaker-proposal-status';

export async function listSpeakerProposals(slug: string, userId: string) {
  const proposals = await db.proposal.findMany({
    where: {
      speakers: { some: { id: userId } },
      event: { slug },
    },
    include: { speakers: true, event: true },
    orderBy: { createdAt: 'desc' },
  });

  return proposals.map((proposal) => ({
    id: proposal.id,
    title: proposal.title,
    talkId: proposal.talkId,
    status: getSpeakerProposalStatus(proposal, proposal.event),
    createdAt: proposal.createdAt.toUTCString(),
    speakers: proposal.speakers.map((speaker) => ({
      id: speaker.id,
      name: speaker.name,
      picture: speaker.picture,
    })),
  }));
}
