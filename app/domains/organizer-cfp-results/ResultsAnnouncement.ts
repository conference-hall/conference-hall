import type { DeliberationStatus } from '@prisma/client';

import { db } from '~/libs/db';
import { ForbiddenOperationError, ProposalNotFoundError } from '~/libs/errors';

import { UserEvent } from '../organizer-event-settings/UserEvent';
import { ProposalAcceptedEmail } from './emails/proposal-accepted.email';
import { ProposalRejectedEmail } from './emails/proposal-rejected.email';

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
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);
    const submitted = await this.countSubmitted(event.id);
    const accepted = await this.getResultsStatistics(event.id, 'ACCEPTED');
    const rejected = await this.getResultsStatistics(event.id, 'REJECTED');
    return { submitted, accepted, rejected };
  }

  async publishAll(status: 'ACCEPTED' | 'REJECTED', withEmails: boolean) {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);

    const proposals = await db.proposal.findMany({
      where: { eventId: event.id, publicationStatus: 'NOT_PUBLISHED', deliberationStatus: status },
      include: { speakers: true },
    });
    if (!proposals.length) throw new ForbiddenOperationError();

    await db.proposal.updateMany({
      data: { publicationStatus: 'PUBLISHED' },
      where: { id: { in: proposals.map(({ id }) => id) } },
    });

    if (withEmails && status === 'ACCEPTED') await ProposalAcceptedEmail.send(event, proposals);
    if (withEmails && status === 'REJECTED') await ProposalRejectedEmail.send(event, proposals);
  }

  async publish(proposalId: string, withEmails: boolean) {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);

    const proposal = await db.proposal.findUnique({
      where: {
        id: proposalId,
        eventId: event.id,
        publicationStatus: 'NOT_PUBLISHED',
        deliberationStatus: { in: ['ACCEPTED', 'REJECTED'] },
      },
      include: { speakers: true },
    });
    if (!proposal) throw new ProposalNotFoundError();

    await db.proposal.update({ data: { publicationStatus: 'PUBLISHED' }, where: { id: proposal.id } });

    if (withEmails && proposal.deliberationStatus === 'ACCEPTED') await ProposalAcceptedEmail.send(event, [proposal]);
    if (withEmails && proposal.deliberationStatus === 'REJECTED') await ProposalRejectedEmail.send(event, [proposal]);
  }

  private async countSubmitted(eventId: string) {
    return db.proposal.count({ where: { eventId, isDraft: false, deliberationStatus: 'PENDING' } });
  }

  private async getResultsStatistics(eventId: string, status: DeliberationStatus) {
    const published = await db.proposal.count({
      where: { eventId, deliberationStatus: status, publicationStatus: 'PUBLISHED' },
    });
    const notPublished = await db.proposal.count({
      where: { eventId, deliberationStatus: status, publicationStatus: 'NOT_PUBLISHED' },
    });
    return { total: published + notPublished, published, notPublished };
  }
}
