import { db } from '~/libs/db';

import { UserEvent } from '../organizer-event-settings/UserEvent';

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

  async add(message: string) {
    await this.userEvent.allowedFor(['OWNER', 'MEMBER', 'REVIEWER']);

    await db.message.create({
      data: { userId: this.userId, proposalId: this.proposalId, message, channel: 'ORGANIZER' },
    });
  }

  async remove(messageId: string) {
    await this.userEvent.allowedFor(['OWNER', 'MEMBER', 'REVIEWER']);

    await db.message.deleteMany({ where: { id: messageId, userId: this.userId, proposalId: this.proposalId } });
  }
}
