import { db } from '~/libs/db';

export async function deleteProposal(proposalId: string, uid: string) {
  await db.proposal.deleteMany({
    where: { id: proposalId, speakers: { some: { id: uid } } },
  });
}
