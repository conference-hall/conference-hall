import type { Prisma } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { z } from 'zod';
import { UserNotFoundError } from '~/libs/errors.server.ts';
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

  async getUserInfo(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { authenticationMethods: true },
    });

    if (!user) throw new UserNotFoundError();

    const memberships = await db.teamMember.findMany({
      where: { memberId: userId },
      include: { team: true },
    });

    return {
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      termsAccepted: user.termsAccepted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      authenticationMethods: user.authenticationMethods.map((method) => ({
        provider: method.provider,
        email: method.email,
        uid: method.uid,
        createdAt: method.createdAt,
      })),
      teams: memberships.map((member) => ({
        slug: member.team.slug,
        name: member.team.name,
        role: member.role,
        updatedAt: member.team.updatedAt,
      })),
    };
  }
}
