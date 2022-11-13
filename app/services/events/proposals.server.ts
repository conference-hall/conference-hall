import { db } from '../../services/db';
import { InvitationNotFoundError, ProposalNotFoundError } from '../errors';
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
 * Invite a co-speaker to a proposal
 * @param invitationId Id of the invitation
 * @param coSpeakerId Id of the co-speaker to add
 */
export async function inviteCoSpeakerToProposal(invitationId: string, coSpeakerId: string) {
  const invitation = await db.invite.findUnique({
    select: { type: true, proposal: true, invitedBy: true },
    where: { id: invitationId },
  });
  if (!invitation || invitation.type !== 'PROPOSAL' || !invitation.proposal) {
    throw new InvitationNotFoundError();
  }

  const proposal = await db.proposal.update({
    select: { id: true, talkId: true, event: true },
    data: { speakers: { connect: { id: coSpeakerId } } },
    where: { id: invitation.proposal.id },
  });

  if (proposal.talkId) {
    await db.talk.update({
      data: { speakers: { connect: { id: coSpeakerId } } },
      where: { id: proposal.talkId },
    });
  }
  return { proposalId: proposal.id, eventSlug: proposal.event.slug };
}

/**
 * Remove a co-speaker from a talk and event
 * @param uid Id of the connected user
 * @param talkId Id of the talk
 * @param eventSlug Slug of the event
 * @param coSpeakerId Id of the co-speaker to remove
 */
export async function removeCoSpeakerFromTalkAndEvent(
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

  await db.proposal.update({
    where: { id: proposal.id },
    data: { speakers: { disconnect: { id: coSpeakerId } } },
  });
}

/**
 * Remove a co-speaker from a proposal
 * @param uid Id of the connected user
 * @param proposalId Id of the proposal
 * @param coSpeakerId Id of the co-speaker to remove
 */
export async function removeCoSpeakerFromProposal(uid: string, proposalId: string, coSpeakerId: string) {
  const proposal = await db.proposal.findFirst({
    where: {
      id: proposalId,
      speakers: { some: { id: uid } },
    },
  });
  if (!proposal) throw new ProposalNotFoundError();

  await db.proposal.update({
    where: { id: proposalId },
    data: { speakers: { disconnect: { id: coSpeakerId } } },
  });
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
