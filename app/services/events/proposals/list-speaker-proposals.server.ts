import { ProposalStatus } from '@prisma/client';
import { makeDomainFunction } from 'domain-functions';
import { z } from 'zod';
import { db } from '~/services/db';

const Schema = z.object({
  speakerId: z.string().min(1),
  eventSlug: z.string().min(1),
});

export const listSpeakerProposals = makeDomainFunction(Schema)(async ({ speakerId, eventSlug }) => {
  const proposals = await db.proposal.findMany({
    include: { speakers: true },
    where: {
      event: { slug: eventSlug },
      speakers: { some: { id: speakerId } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return proposals.map((proposal) => ({
    id: proposal.id,
    title: proposal.title,
    talkId: proposal.talkId,
    isDraft: proposal.status === ProposalStatus.DRAFT,
    isSubmitted: proposal.status === ProposalStatus.SUBMITTED,
    isAccepted: proposal.status === ProposalStatus.ACCEPTED && proposal.emailAcceptedStatus !== null,
    isRejected: proposal.status === ProposalStatus.REJECTED && proposal.emailRejectedStatus !== null,
    isConfirmed: proposal.status === ProposalStatus.CONFIRMED,
    isDeclined: proposal.status === ProposalStatus.DECLINED,
    createdAt: proposal.createdAt.toUTCString(),
    speakers: proposal.speakers.map((speaker) => ({
      id: speaker.id,
      name: speaker.name,
      photoURL: speaker.photoURL,
    })),
  }));
});
