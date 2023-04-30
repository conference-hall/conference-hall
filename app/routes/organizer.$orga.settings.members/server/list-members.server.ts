import { OrganizationRole } from '@prisma/client';
import { z } from 'zod';
import { text } from 'zod-form-data';
import { db } from '~/libs/db';
import { allowedForOrga } from '~/shared-server/organizations/check-user-role.server';
import { getPagination } from '~/shared-server/pagination/pagination.server';

export const MembersFilterSchema = z.object({ query: text(z.string().trim().optional()) });

type MembersFilters = z.infer<typeof MembersFilterSchema>;

const RESULTS_BY_PAGE = 15;

export async function listMembers(orgaSlug: string, userId: string, filters: MembersFilters, page: number) {
  await allowedForOrga(orgaSlug, userId, [OrganizationRole.OWNER]);

  const total = await db.organizationMember.count({ where: { organization: { slug: orgaSlug } } });

  const { pageIndex, currentPage, totalPages } = getPagination(page, total, RESULTS_BY_PAGE);

  const members = await db.organizationMember.findMany({
    where: {
      organization: { slug: orgaSlug },
      member: { name: { contains: filters?.query, mode: 'insensitive' } },
    },
    orderBy: { member: { name: 'asc' } },
    include: { member: true },
    skip: pageIndex * RESULTS_BY_PAGE,
    take: RESULTS_BY_PAGE,
  });

  return {
    pagination: { current: currentPage, total: totalPages },
    results: members.map(({ member, role }) => ({
      role,
      id: member.id,
      name: member.name,
      picture: member.picture,
    })),
  };
}
