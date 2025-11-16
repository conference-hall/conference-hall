import type { Prisma } from '@conference-hall/database';
import { db } from '@conference-hall/database';
import { z } from 'zod';
import { Pagination } from '~/shared/pagination/pagination.ts';
import { UserAccount } from '~/shared/user/user-account.server.ts';

export const TeamsSearchFiltersSchema = z.object({
  query: z.string().trim().optional(),
  sort: z.enum(['name', 'createdAt', 'members', 'events']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

type TeamsSearchFilters = z.infer<typeof TeamsSearchFiltersSchema>;

export class AdminTeams {
  private constructor() {}

  static async for(userId: string) {
    await UserAccount.needsAdminRole(userId);
    return new AdminTeams();
  }

  async listTeams(filters: TeamsSearchFilters, page: number, pageSize?: number) {
    const { query } = filters;

    const where: Prisma.TeamWhereInput | undefined = query
      ? { name: { contains: query, mode: 'insensitive' } }
      : undefined;

    const total = await db.team.count({ where });

    const pagination = new Pagination({ page, total, pageSize });

    const teams = await db.team.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        _count: { select: { events: true, members: true } },
      },
      where,
      skip: pagination.pageIndex * pagination.pageSize,
      take: pagination.pageSize,
      orderBy: this.buildOrderBy(filters.sort, filters.order),
    });

    return {
      filters,
      pagination: { current: pagination.page, pages: pagination.pageCount },
      statistics: { total },
      results: teams.map((team) => ({
        id: team.id,
        name: team.name,
        slug: team.slug,
        createdAt: team.createdAt,
        events: { count: team._count.events },
        members: { count: team._count.members },
      })),
    };
  }

  private buildOrderBy(
    sort: TeamsSearchFilters['sort'],
    order: TeamsSearchFilters['order'] = 'asc',
  ): Prisma.TeamOrderByWithRelationInput {
    switch (sort) {
      case 'name':
        return { name: order };
      case 'createdAt':
        return { createdAt: order };
      case 'members':
        return { members: { _count: order } };
      case 'events':
        return { events: { _count: order } };
      default:
        return { createdAt: 'desc' };
    }
  }
}
