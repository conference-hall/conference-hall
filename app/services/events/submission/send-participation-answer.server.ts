import { makeDomainFunction } from 'domain-functions';
import { z } from 'zod';
import { db } from '~/services/db';
import { ProposalNotFoundError } from '~/services/errors';
import { ProposalConfirmedEmail } from '../emails/proposal-confirmed-email';
import { ProposalDeclinedEmail } from '../emails/proposal-declined-email';

const Schema = z.object({
  speakerId: z.string().min(1),
  proposalId: z.string().min(1),
  participation: z.enum(['CONFIRMED', 'DECLINED']),
});

export const sendParticipationAnswer = makeDomainFunction(Schema)(async ({ speakerId, proposalId, participation }) => {
  const proposal = await db.proposal.findFirst({
    where: { id: proposalId, speakers: { some: { id: speakerId } } },
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
});
