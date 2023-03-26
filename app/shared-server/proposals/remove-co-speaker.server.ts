import { db } from '../../libs/db';
import { ProposalNotFoundError } from '../../libs/errors';

export async function removeCoSpeakerFromSubmission(
  uid: string,
  talkId: string,
  eventSlug: string,
  coSpeakerId: string
) {
  const proposal = await db.proposal.findFirst({
    where: {
      talkId,
      event: { slug: eventSlug },
      speakers: { some: { id: uid } },
    },
  });
  if (!proposal) throw new ProposalNotFoundError();

  await removeCoSpeaker(proposal.id, coSpeakerId);
}

export async function removeCoSpeakerFromProposal(uid: string, proposalId: string, coSpeakerId: string) {
  const proposal = await db.proposal.findFirst({
    where: {
      id: proposalId,
      speakers: { some: { id: uid } },
    },
  });
  if (!proposal) throw new ProposalNotFoundError();

  await removeCoSpeaker(proposalId, coSpeakerId);
}

async function removeCoSpeaker(proposalId: string, coSpeakerId: string) {
  await db.proposal.update({
    where: { id: proposalId },
    data: { speakers: { disconnect: { id: coSpeakerId } } },
  });
}
