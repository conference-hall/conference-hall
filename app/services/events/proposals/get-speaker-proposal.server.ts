import { ProposalStatus } from '@prisma/client';
import { makeDomainFunction } from 'domain-functions';
import { z } from 'zod';
import { db } from '~/services/db';
import { ProposalNotFoundError } from '~/services/errors';
import { buildInvitationLink } from '~/services/invitations/invitations.server';
import { jsonToArray } from '~/utils/prisma';

const Schema = z.object({
  speakerId: z.string().min(1),
  proposalId: z.string().min(1),
});

export const getSpeakerProposal = makeDomainFunction(Schema)(async ({ speakerId, proposalId }) => {
  const proposal = await db.proposal.findFirst({
    where: {
      speakers: { some: { id: speakerId } },
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
});
