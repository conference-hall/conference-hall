import { db } from '../db';

export async function deleteSpeakerProposalProposal(proposalId: string, uid: string) {
  await db.proposal.deleteMany({
    where: { id: proposalId, speakers: { some: { id: uid } } },
  });
}
