import { db } from '~/libs/db';

export async function checkProposalInviteCode(code: string) {
  const proposal = await db.proposal.findUnique({
    include: { event: true },
    where: { invitationCode: code },
  });
  if (!proposal) return null;

  return { id: proposal.id, title: proposal.title, eventSlug: proposal.event.slug };
}

export async function addCoSpeakerToProposal(code: string, coSpeakerId: string) {
  const proposal = await checkProposalInviteCode(code);
  if (!proposal) return null;

  await db.proposal.update({
    where: { id: proposal.id },
    data: { speakers: { connect: { id: coSpeakerId } } },
  });

  return { id: proposal.id, eventSlug: proposal.eventSlug };
}
