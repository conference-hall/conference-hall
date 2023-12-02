import type { ProposalStatus } from '@prisma/client';

import { db } from '~/libs/db';
import { ProposalNotFoundError } from '~/libs/errors';

import { UserEvent } from '../organizer-event-settings/UserEvent';
import { ProposalAcceptedEmail } from './emails/proposal-accepted.email';
import { ProposalRejectedEmail } from './emails/proposal-rejected.email';

export type ResultsStatistics = Awaited<ReturnType<typeof ResultsAnnouncement.prototype.statistics>>;

const STATUS_BY_TYPE = {
  accepted: ['ACCEPTED', 'CONFIRMED', 'DECLINED'] as ProposalStatus[],
  rejected: ['REJECTED'] as ProposalStatus[],
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
    const event = await this.userEvent.allowedFor(['OWNER']);
    const submitted = await this.countSubmitted(event.id);
    const accepted = await this.getResultsStatistics(event.id, STATUS_BY_TYPE.accepted);
    const rejected = await this.getResultsStatistics(event.id, STATUS_BY_TYPE.rejected);
    return { submitted, accepted, rejected };
  }

  async publishAll(forType: 'accepted' | 'rejected', withEmails: boolean) {
    const event = await this.userEvent.allowedFor(['OWNER']);
    const statuses = STATUS_BY_TYPE[forType];
    const type = forType === 'accepted' ? 'ACCEPTED' : 'REJECTED';

    const proposals = await db.proposal.findMany({
      where: { eventId: event.id, status: { in: statuses }, result: { is: null } },
      include: { speakers: true },
    });

    await db.resultPublication.createMany({
      data: proposals.map((p) => ({ type, proposalId: p.id, emailStatus: withEmails ? 'SENT' : 'NONE' })),
    });

    if (withEmails && forType === 'accepted') await ProposalAcceptedEmail.send(event, proposals);
    if (withEmails && forType === 'rejected') await ProposalRejectedEmail.send(event, proposals);
  }

  async publishFor(forType: 'accepted' | 'rejected', withEmails: boolean, proposalId: string) {
    const event = await this.userEvent.allowedFor(['OWNER']);
    const statuses = STATUS_BY_TYPE[forType];
    const type = forType === 'accepted' ? 'ACCEPTED' : 'REJECTED';

    const proposal = await db.proposal.findUnique({
      where: { id: proposalId, eventId: event.id, status: { in: statuses }, result: { is: null } },
      include: { speakers: true },
    });
    if (!proposal) throw new ProposalNotFoundError();

    await db.resultPublication.create({
      data: { type, proposalId: proposal.id, emailStatus: withEmails ? 'SENT' : 'NONE' },
    });

    if (withEmails && forType === 'accepted') await ProposalAcceptedEmail.send(event, [proposal]);
    if (withEmails && forType === 'rejected') await ProposalRejectedEmail.send(event, [proposal]);
  }

  async unpublish(forType: 'accepted', proposalIds: Array<string>) {
    const type = forType === 'accepted' ? 'ACCEPTED' : 'REJECTED';
    await db.resultPublication.deleteMany({ where: { type: { not: type }, proposalId: { in: proposalIds } } });
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
