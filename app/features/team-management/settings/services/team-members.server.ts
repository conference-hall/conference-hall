import type { TeamRole } from 'prisma/generated/client.ts';
import type { TeamMemberWhereInput } from 'prisma/generated/models.ts';
import { parseWithZod } from '@conform-to/zod/v4';
import { db } from 'prisma/db.server.ts';
import { z } from 'zod';
import type { AuthorizedTeam } from '~/shared/authorization/types.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { Pagination } from '~/shared/pagination/pagination.ts';

export const MembersFiltersSchema = z.object({
  query: z.string().trim().optional(),
  role: z.enum(['OWNER', 'MEMBER', 'REVIEWER']).optional(),
});

export class TeamMembers {
  constructor(private authorizedTeam: AuthorizedTeam) {}

  static for(authorizedTeam: AuthorizedTeam) {
    return new TeamMembers(authorizedTeam);
  }

  async list(filters: z.infer<typeof MembersFiltersSchema>, page: number) {
    const { teamId } = this.authorizedTeam;

    const whereClause: TeamMemberWhereInput = {
      teamId,
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
    const { userId, teamId, permissions } = this.authorizedTeam;
    if (!permissions.canLeaveTeam) throw new ForbiddenOperationError();
    return db.teamMember.delete({ where: { memberId_teamId: { memberId: userId, teamId } } });
  }

  async remove(memberId: string) {
    const { userId, teamId, permissions } = this.authorizedTeam;
    if (!permissions.canManageTeamMembers) throw new ForbiddenOperationError();
    if (memberId === userId) throw new ForbiddenOperationError();
    return db.teamMember.delete({ where: { memberId_teamId: { memberId, teamId } } });
  }

  async changeRole(memberId: string, role: TeamRole) {
    const { userId, teamId, permissions } = this.authorizedTeam;
    if (!permissions.canManageTeamMembers) throw new ForbiddenOperationError();
    if (memberId === userId) throw new ForbiddenOperationError();
    return db.teamMember.update({
      data: { role },
      where: { memberId_teamId: { memberId, teamId } },
    });
  }
}

export function parseUrlFilters(url: string) {
  const params = new URL(url).searchParams;
  const result = parseWithZod(params, { schema: MembersFiltersSchema });
  if (result.status !== 'success') return {};
  return result.value;
}
