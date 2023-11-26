import { db } from '~/libs/db';

import { UserEvent } from '../organizer-event-settings/UserEvent';

export class ProposalReviewDiscussion {
  constructor(
    private userId: string,
    private proposalId: string,
    private userEvent: UserEvent,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string, proposalId: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new ProposalReviewDiscussion(userId, proposalId, userEvent);
  }

  async messages() {
    await this.userEvent.allowedFor(['OWNER', 'MEMBER', 'REVIEWER']);

    const messages = await db.message.findMany({ where: { proposalId: this.proposalId }, include: { user: true } });

    return messages
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((message) => ({
        id: message.id,
        userId: message.userId,
        name: message.user.name,
        picture: message.user.picture,
        message: message.message,
      }));
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
