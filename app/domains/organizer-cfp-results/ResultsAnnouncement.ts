import type { ProposalStatus } from '@prisma/client';

import { db } from '~/libs/db';

import { UserEvent } from '../organizer-event-settings/UserEvent';

export type ResultsStatistics = Awaited<ReturnType<typeof ResultsAnnouncement.prototype.statistics>>;

export class ResultsAnnouncement {
  constructor(
    private userId: string,
    private userEvent: UserEvent,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new ResultsAnnouncement(userId, userEvent);
  }

  async statistics() {
    const event = await this.userEvent.allowedFor(['OWNER']);
    const submitted = await this.countSubmitted(event.id);
    const accepted = await this.getResultsStatistics(event.id, ['ACCEPTED', 'CONFIRMED', 'DECLINED']);
    const rejected = await this.getResultsStatistics(event.id, ['REJECTED']);
    return { submitted, accepted, rejected };
  }

  private async countSubmitted(eventId: string) {
    return db.proposal.count({ where: { eventId, status: 'SUBMITTED' } });
  }

  private async getResultsStatistics(eventId: string, statuses: Array<ProposalStatus>) {
    const published = await db.proposal.count({
      where: { eventId, status: { in: statuses }, result: { isNot: null } },
    });
    const notPublished = await db.proposal.count({
      where: { eventId, status: { in: statuses }, result: { is: null } },
    });
    return { total: published + notPublished, published, notPublished };
  }
}
