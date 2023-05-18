import { jsonToArray } from '~/libs/prisma';
import { getSpeakerProposalStatus } from '~/server/proposals/get-speaker-proposal-status';

import { db } from '../../libs/db';
import { ProposalNotFoundError } from '../../libs/errors';
import { buildInvitationLink } from '../invitations/build-link.server';

export async function getSpeakerProposal(proposalId: string, userId: string) {
  const proposal = await db.proposal.findFirst({
    where: {
      speakers: { some: { id: userId } },
      id: proposalId,
    },
    include: {
      event: true,
      speakers: true,
      formats: true,
      categories: true,
      talk: true,
    },
  });

  if (!proposal) throw new ProposalNotFoundError();

  return {
    id: proposal.id,
    talkId: proposal.talkId,
    title: proposal.title,
    abstract: proposal.abstract,
    level: proposal.level,
    references: proposal.references,
    status: getSpeakerProposalStatus(proposal, proposal.event),
    createdAt: proposal.createdAt.toUTCString(),
    languages: jsonToArray(proposal.languages),
    formats: proposal.formats.map(({ id, name }) => ({ id, name })),
    categories: proposal.categories.map(({ id, name }) => ({ id, name })),
    invitationLink: buildInvitationLink('proposal', proposal.invitationCode),
    speakers: proposal.speakers.map((speaker) => ({
      id: speaker.id,
      name: speaker.name,
      picture: speaker.picture,
      isOwner: speaker.id === proposal?.talk?.creatorId,
    })),
  };
}