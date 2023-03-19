import { db } from '../../../libs/db';
import { ProposalNotFoundError } from '../../../libs/errors';
import { ProposalConfirmedEmail } from './emails/proposal-confirmed-email';
import { ProposalDeclinedEmail } from './emails/proposal-declined-email';

export async function sendParticipationAnswer(
  uid: string,
  proposalId: string,
  participation: 'CONFIRMED' | 'DECLINED'
) {
  const proposal = await db.proposal.findFirst({
    where: { id: proposalId, speakers: { some: { id: uid } } },
    include: { event: true },
  });

  if (!proposal) throw new ProposalNotFoundError();

  const result = await db.proposal.updateMany({
    where: { id: proposalId, status: 'ACCEPTED' },
    data: { status: participation },
  });

  if (result.count <= 0) return;

  if (participation === 'CONFIRMED') {
    await ProposalConfirmedEmail.send(proposal.event, proposal);
  } else if (participation === 'DECLINED') {
    await ProposalDeclinedEmail.send(proposal.event, proposal);
  }
}
