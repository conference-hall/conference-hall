import { db } from '../../libs/db';
import { ProposalNotFoundError } from '../../libs/errors';
import { buildInvitationLink } from '../invitations/build-link.server';

export async function getProposalSpeakers(talkId: string, eventSlug: string, uid: string) {
  const proposal = await db.proposal.findFirst({
    select: {
      id: true,
      speakers: true,
      talk: { select: { creatorId: true } },
      invitation: true,
    },
    where: {
      talkId,
      event: { slug: eventSlug },
      speakers: { some: { id: uid } },
    },
  });
  if (!proposal) throw new ProposalNotFoundError();

  return {
    id: proposal.id,
    isOwner: uid === proposal?.talk?.creatorId,
    invitationLink: buildInvitationLink(proposal.invitation?.id),
    speakers: proposal.speakers
      .map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        photoURL: speaker.photoURL,
        isOwner: speaker.id === proposal?.talk?.creatorId,
      }))
      .sort((a, b) => (a.isOwner ? -1 : 0) - (b.isOwner ? -1 : 0)),
  };
}
