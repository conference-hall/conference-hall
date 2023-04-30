import { db } from '~/libs/db';
import { InvitationInvalidOrAccepted, InvitationNotFoundError } from '~/libs/errors';

export async function checkProposalInviteCode(code: string) {
  const proposal = await db.proposal.findUnique({
    include: { event: true },
    where: { invitationCode: code },
  });
  if (!proposal) throw new InvitationNotFoundError();

  return { id: proposal.id, title: proposal.title, eventSlug: proposal.event.slug };
}

export async function addCoSpeakerToProposal(code: string, coSpeakerId: string) {
  const proposal = await checkProposalInviteCode(code);

  try {
    await db.proposal.update({
      where: { id: proposal.id },
      data: { speakers: { connect: { id: coSpeakerId } } },
    });
  } catch (e) {
    throw new InvitationInvalidOrAccepted();
  }

  return { id: proposal.id, eventSlug: proposal.eventSlug };
}
