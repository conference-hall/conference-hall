import { randomUUID } from 'node:crypto';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import NewTeamRequestEmail from '~/shared/emails/templates/admin/new-team-request.email.tsx';
import TeamAccessApprovedEmail from '~/shared/emails/templates/organizers/team-access-approved.email.tsx';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { Pagination } from '~/shared/pagination/pagination.ts';
import { db } from '../../../../../prisma/db.server.ts';
import { getSharedServerEnv, getWebServerEnv } from '../../../../../servers/environment.server.ts';

const STATUSES = ['PENDING', 'ACCEPTED', 'REJECTED'] as const;
type Status = (typeof STATUSES)[number];

export class TeamAccessRequests {
  static async listRequests(status: Status, page: number) {
    const where = { status };

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

  static async submit(data: { eventName: string; email: string }): Promise<void> {
    const existing = await db.teamAccessRequest.findFirst({ where: { email: data.email, status: 'PENDING' } });
    if (existing) return;

    await db.teamAccessRequest.create({ data: { eventName: data.eventName, email: data.email } });

    const { ADMIN_NOTIFICATION_EMAIL } = getWebServerEnv();
    if (ADMIN_NOTIFICATION_EMAIL) {
      await sendEmail.trigger(NewTeamRequestEmail.buildPayload(ADMIN_NOTIFICATION_EMAIL, data));
    }
  }

  static async activate(token: string, userId: string): Promise<void> {
    const request = await db.teamAccessRequest.findUnique({ where: { token } });

    if (!request) {
      throw new ForbiddenOperationError();
    }

    if (request.usedAt) {
      const user = await db.user.findUnique({ where: { id: userId }, select: { organizerKey: true } });
      if (user?.organizerKey === request.id) return;
      throw new ForbiddenOperationError();
    }

    await db.$transaction(async (tx) => {
      await tx.teamAccessRequest.update({ where: { id: request.id }, data: { usedAt: new Date() } });
      await tx.user.update({ where: { id: userId }, data: { organizerKey: request.id } });
    });
  }

  static async accept(requestId: string): Promise<void> {
    const token = randomUUID();

    const request = await db.teamAccessRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED', token },
    });

    const { APP_URL } = getSharedServerEnv();
    const activateUrl = `${APP_URL}/team/activate?token=${token}`;

    await sendEmail.trigger(
      TeamAccessApprovedEmail.buildPayload(request.email, 'en', {
        eventName: request.eventName,
        activateUrl,
      }),
    );
  }

  static async reject(requestId: string): Promise<void> {
    await db.teamAccessRequest.update({ where: { id: requestId }, data: { status: 'REJECTED' } });
  }
}
