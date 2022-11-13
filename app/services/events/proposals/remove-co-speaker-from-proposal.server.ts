import { makeDomainFunction } from 'domain-functions';
import { z } from 'zod';
import { db } from '~/services/db';
import { ProposalNotFoundError } from '~/services/errors';

const FromSubmissionSchema = z.object({
  speakerId: z.string().min(1),
  talkId: z.string().min(1),
  eventSlug: z.string().min(1),
  coSpeakerId: z.string().min(1),
});

export const removeCoSpeakerFromSubmission = makeDomainFunction(FromSubmissionSchema)(
  async ({ speakerId, eventSlug, talkId, coSpeakerId }) => {
    const proposal = await db.proposal.findFirst({
      where: { talkId, event: { slug: eventSlug }, speakers: { some: { id: speakerId } } },
    });
    if (!proposal) throw new ProposalNotFoundError();

    return removeCoSpeaker(proposal.id, coSpeakerId);
  }
);

const FromProposalSchema = z.object({
  speakerId: z.string().min(1),
  proposalId: z.string().min(1),
  coSpeakerId: z.string().min(1),
});

export const removeCoSpeakerFromProposal = makeDomainFunction(FromProposalSchema)(
  async ({ speakerId, proposalId, coSpeakerId }) => {
    const proposal = await db.proposal.findFirst({
      where: { id: proposalId, speakers: { some: { id: speakerId } } },
    });
    if (!proposal) throw new ProposalNotFoundError();

    return removeCoSpeaker(proposalId, coSpeakerId);
  }
);

function removeCoSpeaker(proposalId: string, coSpeakerId: string) {
  return db.proposal.update({
    where: { id: proposalId },
    data: { speakers: { disconnect: { id: coSpeakerId } } },
  });
}
