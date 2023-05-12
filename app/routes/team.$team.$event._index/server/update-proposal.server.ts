import { TeamRole } from '@prisma/client';
import { db } from '~/libs/db';
import type { ProposalStatusData, ProposalUpdateData } from '~/schemas/proposal';
import { allowedForEvent } from '~/shared-server/organizations/check-user-role.server';

export async function updateProposal(eventSlug: string, proposalId: string, userId: string, data: ProposalUpdateData) {
  await allowedForEvent(eventSlug, userId, [TeamRole.OWNER, TeamRole.MEMBER]);

  const { formats, categories, ...talk } = data;

  return await db.proposal.update({
    where: { id: proposalId },
    data: {
      ...talk,
      formats: { set: [], connect: formats?.map((id) => ({ id })) },
      categories: { set: [], connect: categories?.map((id) => ({ id })) },
    },
  });
}

export async function updateProposalsStatus(
  eventSlug: string,
  userId: string,
  proposalIds: string[],
  status: ProposalStatusData
) {
  await allowedForEvent(eventSlug, userId, [TeamRole.OWNER, TeamRole.MEMBER]);

  const result = await db.proposal.updateMany({ where: { id: { in: proposalIds } }, data: { status } });
  return result.count;
}
