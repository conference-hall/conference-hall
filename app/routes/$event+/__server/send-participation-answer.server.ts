import { db } from '~/libs/db.ts';
import { ProposalNotFoundError } from '~/libs/errors.ts';

import { ProposalConfirmedEmail } from './emails/proposal-confirmed-email.ts';
import { ProposalDeclinedEmail } from './emails/proposal-declined-email.ts';

export async function sendParticipationAnswer(
  userId: string,
  proposalId: string,
  participation: 'CONFIRMED' | 'DECLINED',
) {
  const proposal = await db.proposal.findFirst({
    where: { id: proposalId, speakers: { some: { id: userId } } },
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