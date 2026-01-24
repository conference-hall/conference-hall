import { z } from 'zod';
import type { AuthorizedAdmin } from '~/shared/authorization/types.ts';
import { NotAuthorizedError, UserNotFoundError } from '~/shared/errors.server.ts';
import { Pagination } from '~/shared/pagination/pagination.ts';
import { UserAccount } from '~/shared/user/user-account.server.ts';
import { db } from '../../../../../prisma/db.server.ts';
import type { UserWhereInput } from '../../../../../prisma/generated/models.ts';

export const UsersSearchFiltersSchema = z.object({ query: z.string().trim().optional() });

type UsersSearchFilters = z.infer<typeof UsersSearchFiltersSchema>;

export class AdminUsers {
  private constructor() {}

  static for(authorizedAdmin: AuthorizedAdmin) {
    if (!authorizedAdmin) throw new NotAuthorizedError();
    return new AdminUsers();
  }

  async listUsers(filters: UsersSearchFilters, page: number, pageSize?: number) {
    const { query } = filters;

    const where: UserWhereInput | undefined = query
      ? { OR: [{ email: query }, { name: { contains: query, mode: 'insensitive' } }] }
      : undefined;

    const total = await db.user.count({ where });

    const pagination = new Pagination({ page, total, pageSize });

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
      include: { accounts: true, sessions: { orderBy: { createdAt: 'desc' } } },
    });

    if (!user) throw new UserNotFoundError();

    const memberships = await db.teamMember.findMany({
      where: { memberId: userId },
      include: { team: true },
    });

    const talksCount = await db.talk.count({
      where: { speakers: { some: { id: userId } } },
    });

    const lastSession = user.sessions.at(0);

    return {
      uid: user.uid,
      name: user.name,
      email: user.email,
      termsAccepted: user.termsAccepted,
      emailVerified: user.emailVerified,
      lastSignInAt: lastSession?.createdAt,
      updatedAt: user.updatedAt,
      createdAt: user.createdAt,
      deletedAt: user.deletedAt,
      talksCount,
      accounts: user.accounts.map((account) => ({
        accountId: account.accountId,
        providerId: account.providerId,
        createdAt: account.createdAt,
      })),
      teams: memberships.map((member) => ({
        slug: member.team.slug,
        name: member.team.name,
        role: member.role,
        createdAt: member.createdAt,
      })),
    };
  }

  async deleteUser(targetUserId: string) {
    await UserAccount.for(targetUserId).deleteAccount({ sendConfirmationEmail: false });
  }
}
