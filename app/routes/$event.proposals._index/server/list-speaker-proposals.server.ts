import { ProposalStatus } from '@prisma/client';
import { db } from '../../../libs/db';

export async function listSpeakerProposals(slug: string, uid: string) {
  const proposals = await db.proposal.findMany({
    include: { speakers: true },
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
    isDraft: proposal.status === ProposalStatus.DRAFT,
    isSubmitted: proposal.status === ProposalStatus.SUBMITTED,
    isAccepted: proposal.status === ProposalStatus.ACCEPTED && proposal.emailAcceptedStatus !== null,
    isRejected: proposal.status === ProposalStatus.REJECTED && proposal.emailRejectedStatus !== null,
    isConfirmed: proposal.status === ProposalStatus.CONFIRMED,
    isDeclined: proposal.status === ProposalStatus.DECLINED,
    createdAt: proposal.createdAt.toUTCString(),
    speakers: proposal.speakers.map((speaker) => ({
      id: speaker.id,
      name: speaker.name,
      photoURL: speaker.photoURL,
    })),
  }));
}
