import type { TeamRole } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { z } from 'zod';

import { ForbiddenOperationError } from '~/libs/errors.server.ts';
import { parseWithZod } from '~/libs/zod-parser.ts';

import { Pagination } from '../shared/pagination.cap.ts';
import { UserTeam } from './user-team.ts';

export const MembersFiltersSchema = z.object({ query: z.string().trim().optional() });

export class TeamMembers {
  constructor(private team: UserTeam) {}

  static for(userId: string, slug: string) {
    const team = UserTeam.for(userId, slug);
    return new TeamMembers(team);
  }

  async list(filters: z.infer<typeof MembersFiltersSchema>, page: number) {
    await this.team.allowedFor(['OWNER']);

    const { slug } = this.team;

    const total = await db.teamMember.count({ where: { team: { slug } } });

    const pagination = new Pagination({ page, total });

    const members = await db.teamMember.findMany({
      where: {
        team: { slug },
        member: { name: { contains: filters?.query, mode: 'insensitive' } },
      },
      orderBy: { member: { name: 'asc' } },
      include: { member: true },
      skip: pagination.pageIndex * pagination.pageSize,
      take: pagination.pageSize,
    });

    return {
      pagination: { current: pagination.page, total: pagination.pageCount },
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

export function parseUrlFilters(url: string) {
  const params = new URL(url).searchParams;
  const result = parseWithZod(params, MembersFiltersSchema);
  return result.value || {};
}
