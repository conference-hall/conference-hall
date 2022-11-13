import { makeDomainFunction } from 'domain-functions';
import { z } from 'zod';
import { db } from '~/services/db';
import { InvitationNotFoundError } from '~/services/errors';

const Schema = z.object({
  invitationId: z.string().min(1),
  coSpeakerId: z.string().min(1),
});

export const addCoSpeakerToProposal = makeDomainFunction(Schema)(async ({ invitationId, coSpeakerId }) => {
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
});
