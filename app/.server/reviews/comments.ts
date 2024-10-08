import { db } from 'prisma/db.server.ts';

import { UserEvent } from '../event-settings/user-event.ts';

export class Comments {
  constructor(
    private userId: string,
    private proposalId: string,
    private userEvent: UserEvent,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string, proposalId: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new Comments(userId, proposalId, userEvent);
  }

  async add(comment: string) {
    await this.userEvent.needsPermission('canAccessEvent');

    await db.comment.create({
      data: { userId: this.userId, proposalId: this.proposalId, comment, channel: 'ORGANIZER' },
    });
  }

  async remove(messageId: string) {
    await this.userEvent.needsPermission('canAccessEvent');

    await db.comment.deleteMany({ where: { id: messageId, userId: this.userId, proposalId: this.proposalId } });
  }
}
