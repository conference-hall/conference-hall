import { TeamRole } from '@prisma/client';
import { z } from 'zod';

import { db } from '~/libs/db';
import { text } from '~/schemas/utils';
import { getPagination } from '~/server/pagination/pagination.server';
import { allowedForTeam } from '~/server/teams/check-user-role.server';

export const MembersFilterSchema = z.object({ query: text(z.string().trim().optional()) });

type MembersFilters = z.infer<typeof MembersFilterSchema>;

const RESULTS_BY_PAGE = 15;

export async function listMembers(teamSlug: string, userId: string, filters: MembersFilters, page: number) {
  await allowedForTeam(teamSlug, userId, [TeamRole.OWNER]);

  const total = await db.teamMember.count({ where: { team: { slug: teamSlug } } });

  const { pageIndex, currentPage, totalPages } = getPagination(page, total, RESULTS_BY_PAGE);

  const members = await db.teamMember.findMany({
    where: {
      team: { slug: teamSlug },
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
