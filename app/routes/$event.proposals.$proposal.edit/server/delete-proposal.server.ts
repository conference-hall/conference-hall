import { db } from '~/libs/db';

export async function deleteProposal(proposalId: string, userId: string) {
  await db.proposal.deleteMany({
    where: { id: proposalId, speakers: { some: { id: userId } } },
  });
}
