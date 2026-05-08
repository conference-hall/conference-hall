import type { AuthorizedAdmin } from '~/shared/authorization/types.ts';
import { NotAuthorizedError } from '~/shared/errors.server.ts';
import { Pagination } from '~/shared/pagination/pagination.ts';
import { db } from '../../../../../prisma/db.server.ts';

export class AdminRequests {
  private constructor() {}

  static for(authorizedAdmin: AuthorizedAdmin) {
    if (!authorizedAdmin) throw new NotAuthorizedError();
    return new AdminRequests();
  }

  async listRequests(status: string | undefined, page: number) {
    const where = status ? { status: status as 'PENDING' | 'ACCEPTED' | 'REJECTED' } : undefined;

    const total = await db.teamAccessRequest.count({ where });
    const pagination = new Pagination({ page, total });

    const requests = await db.teamAccessRequest.findMany({
      where,
      skip: pagination.pageIndex * pagination.pageSize,
      take: pagination.pageSize,
      orderBy: { createdAt: 'desc' },
    });

    return {
      filters: { status },
      pagination: { current: pagination.page, pages: pagination.pageCount },
      statistics: { total },
      results: requests.map((r) => ({
        id: r.id,
        eventName: r.eventName,
        email: r.email,
        status: r.status,
        createdAt: r.createdAt,
      })),
    };
  }
}
