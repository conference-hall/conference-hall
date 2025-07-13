import { parseWithZod } from '@conform-to/zod/v4';
import type { Prisma, TeamRole } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { z } from 'zod/v4';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { Pagination } from '~/shared/pagination/pagination.ts';
import { UserTeamAuthorization } from '~/shared/user/user-team-authorization.server.ts';

export const MembersFiltersSchema = z.object({
  query: z.string().trim().optional(),
  role: z.enum(['OWNER', 'MEMBER', 'REVIEWER']).optional(),
});

export class TeamMembers extends UserTeamAuthorization {
  static for(userId: string, team: string) {
    return new TeamMembers(userId, team);
  }

  async list(filters: z.infer<typeof MembersFiltersSchema>, page: number) {
    await this.needsPermission('canAccessTeam');

    const whereClause: Prisma.TeamMemberWhereInput = {
      team: { slug: this.team },
      ...(filters?.query && { member: { name: { contains: filters.query, mode: 'insensitive' } } }),
      ...(filters?.role && { role: filters.role }),
    };

    const total = await db.teamMember.count({ where: whereClause });

    const pagination = new Pagination({ page, total });

    const members = await db.teamMember.findMany({
      where: whereClause,
      orderBy: { member: { name: 'asc' } },
      include: { member: true },
      skip: pagination.pageIndex * pagination.pageSize,
      take: pagination.pageSize,
    });

    return {
      members: members.map(({ member, role }) => ({
        role,
        id: member.id,
        name: member.name,
        picture: member.picture,
      })),
      pagination: { current: pagination.page, total: pagination.pageCount },
      statistics: { total },
    };
  }

  async leave() {
    const { memberId, teamId } = await this.needsPermission('canLeaveTeam');
    return db.teamMember.delete({ where: { memberId_teamId: { memberId, teamId } } });
  }

  async remove(memberId: string) {
    await this.needsPermission('canManageTeamMembers');
    if (memberId === this.userId) throw new ForbiddenOperationError();
    return db.teamMember.deleteMany({ where: { team: { slug: this.team }, memberId } });
  }

  async changeRole(memberId: string, role: TeamRole) {
    await this.needsPermission('canManageTeamMembers');
    if (memberId === this.userId) throw new ForbiddenOperationError();
    return await db.teamMember.updateMany({ data: { role }, where: { team: { slug: this.team }, memberId } });
  }
}

export function parseUrlFilters(url: string) {
  const params = new URL(url).searchParams;
  const result = parseWithZod(params, { schema: MembersFiltersSchema });
  if (result.status !== 'success') return {};
  return result.value;
}
