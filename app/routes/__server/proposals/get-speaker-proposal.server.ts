import { InvitationLink } from '~/domains/shared/InvitationLink.ts';
import { db } from '~/libs/db.ts';
import { ProposalNotFoundError } from '~/libs/errors.ts';
import { jsonToArray } from '~/libs/prisma.ts';
import { getSpeakerProposalStatus } from '~/routes/__server/proposals/get-speaker-proposal-status.ts';

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
    invitationLink: InvitationLink.build('proposal', proposal.invitationCode),
    speakers: proposal.speakers.map((speaker) => ({
      id: speaker.id,
      name: speaker.name,
      picture: speaker.picture,
      company: speaker.company,
      isOwner: speaker.id === proposal?.talk?.creatorId,
    })),
  };
}
