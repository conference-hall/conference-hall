import { buildInvitationLink } from '~/shared-server/invitations/build-link.server';
import { db } from '../../libs/db';
import { ProposalNotFoundError } from '../../libs/errors';

export async function getSubmittedProposal(talkId: string, eventSlug: string, userId: string) {
  const proposal = await db.proposal.findFirst({
    select: {
      id: true,
      title: true,
      talk: { select: { creatorId: true } },
      speakers: true,
      invitation: true,
      formats: true,
      categories: true,
    },
    where: { talkId, event: { slug: eventSlug }, speakers: { some: { id: userId } } },
  });
  if (!proposal) throw new ProposalNotFoundError();

  return {
    id: proposal.id,
    title: proposal.title,
    isOwner: userId === proposal?.talk?.creatorId,
    invitationLink: buildInvitationLink(proposal.invitation?.id),
    speakers: proposal.speakers
      .map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        picture: speaker.picture,
        isOwner: speaker.id === proposal?.talk?.creatorId,
      }))
      .sort((a, b) => (a.isOwner ? -1 : 0) - (b.isOwner ? -1 : 0)),
    formats: proposal.formats.map((f) => ({ id: f.id, name: f.name })),
    categories: proposal.categories.map((c) => ({ id: c.id, name: c.name })),
  };
}
