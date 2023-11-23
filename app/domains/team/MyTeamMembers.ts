import type { TeamRole } from '@prisma/client';
import { z } from 'zod';

import { db } from '~/libs/db';
import { ForbiddenOperationError } from '~/libs/errors';
import { getPagination } from '~/routes/__server/pagination/pagination.server';

import { MyTeam } from './MyTeam';

const DEFAULT_PAGE_SIZE = 15;

export const MembersFiltersSchema = z.object({ query: z.string().trim().optional() });

export class MyTeamMembers {
  constructor(private team: MyTeam) {}

  static for(userId: string, slug: string) {
    const team = MyTeam.for(userId, slug);
    return new MyTeamMembers(team);
  }

  async list(filters: z.infer<typeof MembersFiltersSchema>, page: number) {
    await this.team.allowedFor(['OWNER']);

    const { slug } = this.team;

    const total = await db.teamMember.count({ where: { team: { slug } } });

    const { pageIndex, currentPage, totalPages } = getPagination(page, total, DEFAULT_PAGE_SIZE);

    const members = await db.teamMember.findMany({
      where: {
        team: { slug },
        member: { name: { contains: filters?.query, mode: 'insensitive' } },
      },
      orderBy: { member: { name: 'asc' } },
      include: { member: true },
      skip: pageIndex * DEFAULT_PAGE_SIZE,
      take: DEFAULT_PAGE_SIZE,
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

  async remove(memberId: string) {
    await this.team.allowedFor(['OWNER']);

    const { userId, slug } = this.team;
    if (memberId === userId) throw new ForbiddenOperationError();
    return db.teamMember.deleteMany({ where: { team: { slug }, memberId } });
  }

  async changeRole(memberId: string, role: TeamRole) {
    await this.team.allowedFor(['OWNER']);

    const { userId, slug } = this.team;
    if (userId === memberId) throw new ForbiddenOperationError();
    return await db.teamMember.updateMany({ data: { role }, where: { team: { slug }, memberId } });
  }
}
