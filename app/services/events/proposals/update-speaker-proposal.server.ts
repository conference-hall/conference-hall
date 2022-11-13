import type { UnpackResult } from 'domain-functions';
import { errorMessagesForSchema, makeDomainFunction } from 'domain-functions';
import { z } from 'zod';
import { ProposalUpdateSchema } from '~/schemas/proposal';
import { db } from '~/services/db';
import { CfpNotOpenError, EventNotFoundError, ProposalNotFoundError } from '~/services/errors';
import { getCfpState } from '~/utils/event';

const Schema = ProposalUpdateSchema.extend({
  eventSlug: z.string().min(1),
  proposalId: z.string().min(1),
  speakerId: z.string().min(1),
});

export const updateSpeakerProposal = makeDomainFunction(Schema)(
  async ({ eventSlug, speakerId, proposalId, ...data }) => {
    const event = await db.event.findUnique({
      select: { id: true, type: true, cfpStart: true, cfpEnd: true },
      where: { slug: eventSlug },
    });
    if (!event) throw new EventNotFoundError();

    const isCfpOpen = getCfpState(event.type, event.cfpStart, event.cfpEnd) === 'OPENED';
    if (!isCfpOpen) throw new CfpNotOpenError();

    const proposal = await db.proposal.findFirst({ where: { id: proposalId, speakers: { some: { id: speakerId } } } });
    if (!proposal) throw new ProposalNotFoundError();

    const { formats, categories, ...talk } = data;

    await db.proposal.update({
      where: { id: proposalId },
      data: {
        ...talk,
        speakers: { set: [], connect: [{ id: speakerId }] },
        formats: { set: [], connect: formats?.map((id) => ({ id })) },
        categories: { set: [], connect: categories?.map((id) => ({ id })) },
      },
    });

    if (proposal.talkId) {
      await db.talk.update({ where: { id: proposal.talkId }, data: talk });
    }
  }
);

export const toErrors = (result: UnpackResult<typeof updateSpeakerProposal>) => {
  return errorMessagesForSchema(result.inputErrors, Schema);
};
