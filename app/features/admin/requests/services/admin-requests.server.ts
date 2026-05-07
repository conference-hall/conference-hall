import crypto from 'node:crypto';
import type { AuthorizedAdmin } from '~/shared/authorization/types.ts';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import WelcomeOrganizerEmail from '~/shared/emails/templates/organizers/welcome-organizer.email.tsx';
import { NotAuthorizedError } from '~/shared/errors.server.ts';
import { db } from '../../../../../prisma/db.server.ts';

export class AdminRequests {
  private constructor() {}

  static for(authorizedAdmin: AuthorizedAdmin) {
    if (!authorizedAdmin) throw new NotAuthorizedError();
    return new AdminRequests();
  }

  async listRequests() {
    return db.teamAccessRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async acceptRequest(id: string) {
    const token = crypto.randomUUID();

    const request = await db.teamAccessRequest.update({
      where: { id },
      data: { token, status: 'ACCEPTED', acceptedAt: new Date() },
    });

    await sendEmail.trigger(WelcomeOrganizerEmail.buildPayload(request.email, request.eventName, token));
  }

  async denyRequest(id: string) {
    await db.teamAccessRequest.delete({ where: { id } });
  }
}
