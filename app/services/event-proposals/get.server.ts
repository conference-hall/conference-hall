import { ProposalStatus } from '@prisma/client';
import { jsonToArray } from '~/utils/prisma';
import { db } from '../db';
import { ProposalNotFoundError } from '../errors';
import { buildInvitationLink } from '../invitations/invitations.server';

export async function getSpeakerProposal(proposalId: string, uid: string) {
  const proposal = await db.proposal.findFirst({
    where: {
      speakers: { some: { id: uid } },
      id: proposalId,
    },
    include: {
      speakers: true,
      formats: true,
      categories: true,
      talk: true,
      invitation: true,
    },
  });
  if (!proposal) throw new ProposalNotFoundError();

  return {
    id: proposal.id,
    talkId: proposal.talkId,
    title: proposal.title,
    abstract: proposal.abstract,
    isDraft: proposal.status === ProposalStatus.DRAFT,
    isSubmitted: proposal.status === ProposalStatus.SUBMITTED,
    isAccepted: proposal.status === ProposalStatus.ACCEPTED && proposal.emailAcceptedStatus !== null,
    isRejected: proposal.status === ProposalStatus.REJECTED && proposal.emailRejectedStatus !== null,
    isConfirmed: proposal.status === ProposalStatus.CONFIRMED,
    isDeclined: proposal.status === ProposalStatus.DECLINED,
    level: proposal.level,
    references: proposal.references,
    createdAt: proposal.createdAt.toUTCString(),
    languages: jsonToArray(proposal.languages),
    formats: proposal.formats.map(({ id, name }) => ({ id, name })),
    categories: proposal.categories.map(({ id, name }) => ({ id, name })),
    invitationLink: buildInvitationLink(proposal.invitation?.id),
    speakers: proposal.speakers.map((speaker) => ({
      id: speaker.id,
      name: speaker.name,
      photoURL: speaker.photoURL,
      isOwner: speaker.id === proposal?.talk?.creatorId,
    })),
  };
}
