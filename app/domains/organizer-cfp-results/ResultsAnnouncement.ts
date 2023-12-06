import type { DeliberationStatus, ResultPublicationType } from '@prisma/client';

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

  async publishAll(type: ResultPublicationType, withEmails: boolean) {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);

    const proposals = await db.proposal.findMany({
      where: { eventId: event.id, deliberationStatus: type, result: { is: null } },
      include: { speakers: true },
    });

    await db.resultPublication.createMany({
      data: proposals.map((p) => ({ type, proposalId: p.id, emailStatus: withEmails ? 'SENT' : 'NONE' })),
    });

    if (withEmails && type === 'ACCEPTED') await ProposalAcceptedEmail.send(event, proposals);
    if (withEmails && type === 'REJECTED') await ProposalRejectedEmail.send(event, proposals);
  }

  async publish(proposalId: string, withEmails: boolean) {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);

    const proposal = await db.proposal.findUnique({
      where: { id: proposalId, eventId: event.id, result: { is: null } },
      include: { speakers: true },
    });
    if (!proposal) throw new ProposalNotFoundError();

    if (proposal.deliberationStatus !== 'ACCEPTED' && proposal.deliberationStatus !== 'REJECTED') {
      throw new ForbiddenOperationError();
    }

    await db.resultPublication.create({
      data: { type: proposal.deliberationStatus, proposalId: proposal.id, emailStatus: withEmails ? 'SENT' : 'NONE' },
    });

    if (withEmails && proposal.deliberationStatus === 'ACCEPTED') await ProposalAcceptedEmail.send(event, [proposal]);
    if (withEmails && proposal.deliberationStatus === 'REJECTED') await ProposalRejectedEmail.send(event, [proposal]);
  }

  async unpublish(proposalIds: Array<string>) {
    await db.resultPublication.deleteMany({ where: { proposalId: { in: proposalIds } } });
  }

  private async countSubmitted(eventId: string) {
    return db.proposal.count({ where: { eventId, isDraft: false, deliberationStatus: 'PENDING' } });
  }

  private async getResultsStatistics(eventId: string, status: DeliberationStatus) {
    const published = await db.proposal.count({
      where: { eventId, deliberationStatus: status, result: { isNot: null } },
    });
    const notPublished = await db.proposal.count({
      where: { eventId, deliberationStatus: status, result: { is: null } },
    });
    return { total: published + notPublished, published, notPublished };
  }
}
