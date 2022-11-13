import { makeDomainFunction } from 'domain-functions';
import { z } from 'zod';
import { db } from '~/services/db';

const Schema = z.object({
  speakerId: z.string().min(1),
  proposalId: z.string().min(1),
});

export const deleteSpeakerProposal = makeDomainFunction(Schema)(async ({ speakerId, proposalId }) => {
  await db.proposal.deleteMany({
    where: { id: proposalId, speakers: { some: { id: speakerId } } },
  });
});
