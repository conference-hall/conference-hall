import type { Prisma } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { z } from 'zod';
import { Pagination } from '../shared/pagination.ts';
import { needsAdminRole } from './authorization.ts';

export const UsersSearchFiltersSchema = z.object({ query: z.string().trim().optional() });

type UsersSearchFilters = z.infer<typeof UsersSearchFiltersSchema>;

export class AdminUsers {
  private constructor() {}

  static async for(userId: string) {
    await needsAdminRole(userId);
    return new AdminUsers();
  }

  async listUsers(filters: UsersSearchFilters, page: number) {
    const { query } = filters;

    const where: Prisma.UserWhereInput | undefined = query
      ? { OR: [{ email: query }, { name: { contains: query, mode: 'insensitive' } }] }
      : undefined;

    const total = await db.user.count({ where });

    const pagination = new Pagination({ page, total });

    const users = await db.user.findMany({
      where,
      skip: pagination.pageIndex * pagination.pageSize,
      take: pagination.pageSize,
      orderBy: { createdAt: 'desc' },
    });

    return {
      filters,
      pagination: { current: pagination.page, pages: pagination.pageCount },
      statistics: { total },
      results: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      })),
    };
  }
}
