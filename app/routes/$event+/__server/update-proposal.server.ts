import { db } from '~/libs/db';
import { CfpNotOpenError, EventNotFoundError, ProposalNotFoundError } from '~/libs/errors';
import type { ProposalUpdateData } from '~/routes/__types/proposal';
import { getCfpState } from '~/utils/event';

export async function updateProposal(slug: string, proposalId: string, userId: string, data: ProposalUpdateData) {
  const event = await db.event.findUnique({
    select: { id: true, type: true, cfpStart: true, cfpEnd: true },
    where: { slug },
  });
  if (!event) throw new EventNotFoundError();

  const isCfpOpen = getCfpState(event.type, event.cfpStart, event.cfpEnd) === 'OPENED';
  if (!isCfpOpen) throw new CfpNotOpenError();

  const proposal = await db.proposal.findFirst({
    where: { id: proposalId, speakers: { some: { id: userId } } },
  });
  if (!proposal) throw new ProposalNotFoundError();

  const { formats, categories, ...talk } = data;

  await db.proposal.update({
    where: { id: proposalId },
    data: {
      ...talk,
      speakers: { set: [], connect: [{ id: userId }] },
      formats: { set: [], connect: formats?.map((id) => ({ id })) },
      categories: { set: [], connect: categories?.map((id) => ({ id })) },
    },
  });

  if (proposal.talkId) {
    await db.talk.update({
      where: { id: proposal.talkId },
      data: talk,
    });
  }
}
