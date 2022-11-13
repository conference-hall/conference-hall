import { db } from '../../services/db';
import { ProposalNotFoundError } from '../errors';
import { ProposalConfirmedEmail } from './emails/proposal-confirmed-email';
import { ProposalDeclinedEmail } from './emails/proposal-declined-email';

export async function isTalkAlreadySubmitted(slug: string, talkId: string, uid: string) {
  const proposal = await db.proposal.findFirst({
    where: {
      talk: { id: talkId },
      event: { slug },
      status: { not: 'DRAFT' },
      speakers: { some: { id: uid } },
    },
  });
  return Boolean(proposal);
}

/**
 * Send the speaker response for proposal participation to event
 * @param uid Id of the speaker
 * @param proposalId Id of the proposal
 * @param participation confirmed or declined
 */
export async function sendProposalParticipation(
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
