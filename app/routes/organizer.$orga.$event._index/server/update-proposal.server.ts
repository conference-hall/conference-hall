import { OrganizationRole } from '@prisma/client';
import type { ProposalStatusData, ProposalUpdateData } from '~/schemas/proposal';
import { db } from '../../../libs/db';
import { checkUserRole } from '~/shared-server/organizations/check-user-role.server';

export async function updateProposal(
  orgaSlug: string,
  eventSlug: string,
  proposalId: string,
  userId: string,
  data: ProposalUpdateData
) {
  await checkUserRole(orgaSlug, eventSlug, userId, [OrganizationRole.OWNER, OrganizationRole.MEMBER]);

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
  orgaSlug: string,
  eventSlug: string,
  userId: string,
  proposalIds: string[],
  status: ProposalStatusData
) {
  await checkUserRole(orgaSlug, eventSlug, userId, [OrganizationRole.OWNER, OrganizationRole.MEMBER]);

  const result = await db.proposal.updateMany({ where: { id: { in: proposalIds } }, data: { status } });
  return result.count;
}
