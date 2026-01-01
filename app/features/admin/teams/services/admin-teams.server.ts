import { db } from 'prisma/db.server.ts';
import type { TeamOrderByWithRelationInput, TeamWhereInput } from 'prisma/generated/models.ts';
import { z } from 'zod';
import type { AuthorizedAdmin } from '~/shared/authorization/types.ts';
import { NotAuthorizedError } from '~/shared/errors.server.ts';
import { Pagination } from '~/shared/pagination/pagination.ts';

export const TeamsSearchFiltersSchema = z.object({
  query: z.string().trim().optional(),
  sort: z.enum(['name', 'createdAt', 'members', 'events']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

type TeamsSearchFilters = z.infer<typeof TeamsSearchFiltersSchema>;

export class AdminTeams {
  private constructor() {}

  static for(authorizedAdmin: AuthorizedAdmin) {
    if (!authorizedAdmin) throw new NotAuthorizedError();
    return new AdminTeams();
  }

  async listTeams(filters: TeamsSearchFilters, page: number, pageSize?: number) {
    const { query } = filters;

    const where: TeamWhereInput | undefined = query ? { name: { contains: query, mode: 'insensitive' } } : undefined;

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
  ): TeamOrderByWithRelationInput {
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
