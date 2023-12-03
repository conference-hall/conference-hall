import type { ProposalStatus, ResultPublicationType } from '@prisma/client';

import { db } from '~/libs/db';
import { ForbiddenOperationError, ProposalNotFoundError } from '~/libs/errors';

import { UserEvent } from '../organizer-event-settings/UserEvent';
import { ProposalAcceptedEmail } from './emails/proposal-accepted.email';
import { ProposalRejectedEmail } from './emails/proposal-rejected.email';

export type ResultsStatistics = Awaited<ReturnType<typeof ResultsAnnouncement.prototype.statistics>>;

const STATUS_BY_TYPE = {
  ACCEPTED: ['ACCEPTED', 'CONFIRMED', 'DECLINED'] as ProposalStatus[],
  REJECTED: ['REJECTED'] as ProposalStatus[],
};

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
    const accepted = await this.getResultsStatistics(event.id, STATUS_BY_TYPE.ACCEPTED);
    const rejected = await this.getResultsStatistics(event.id, STATUS_BY_TYPE.REJECTED);
    return { submitted, accepted, rejected };
  }

  async publishAll(type: ResultPublicationType, withEmails: boolean) {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);

    const statuses = STATUS_BY_TYPE[type];

    const proposals = await db.proposal.findMany({
      where: { eventId: event.id, status: { in: statuses }, result: { is: null } },
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
    if (proposal.status !== 'ACCEPTED' && proposal.status !== 'REJECTED') throw new ForbiddenOperationError();

    await db.resultPublication.create({
      data: { type: proposal.status, proposalId: proposal.id, emailStatus: withEmails ? 'SENT' : 'NONE' },
    });

    if (withEmails && proposal.status === 'ACCEPTED') await ProposalAcceptedEmail.send(event, [proposal]);
    if (withEmails && proposal.status === 'REJECTED') await ProposalRejectedEmail.send(event, [proposal]);
  }

  async unpublish(proposalIds: Array<string>) {
    await db.resultPublication.deleteMany({ where: { proposalId: { in: proposalIds } } });
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
