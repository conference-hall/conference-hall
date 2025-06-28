import { db } from 'prisma/db.server.ts';
import { sendEmail } from '~/emails/send-email.job.ts';
import ProposalAcceptedEmail from '~/emails/templates/speakers/proposal-accepted.tsx';
import { sendProposalRejectedEmailToSpeakers } from '~/emails/templates/speakers/proposal-rejected.tsx';
import { ForbiddenOperationError, ProposalNotFoundError } from '~/libs/errors.server.ts';
import { UserEvent } from '../event-settings/user-event.ts';

export class Publication {
  constructor(
    private userId: string,
    private userEvent: UserEvent,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new Publication(userId, userEvent);
  }

  async publishAll(status: 'ACCEPTED' | 'REJECTED', withEmails: boolean) {
    const event = await this.userEvent.needsPermission('canPublishEventResults');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const proposals = await db.proposal.findMany({
      where: { eventId: event.id, publicationStatus: 'NOT_PUBLISHED', deliberationStatus: status },
      include: { speakers: true, formats: true },
    });
    if (!proposals.length) throw new ForbiddenOperationError();

    await db.proposal.updateMany({
      where: { id: { in: proposals.map(({ id }) => id) } },
      data: { publicationStatus: 'PUBLISHED', confirmationStatus: status === 'ACCEPTED' ? 'PENDING' : null },
    });

    if (withEmails && status === 'ACCEPTED') {
      await Promise.all(
        proposals.map((proposal) => sendEmail.trigger(ProposalAcceptedEmail.buildPayload({ event, proposal }))),
      );
    }

    if (withEmails && status === 'REJECTED') {
      await Promise.all(proposals.map((proposal) => sendProposalRejectedEmailToSpeakers({ event, proposal })));
    }
  }

  async publish(proposalId: string, withEmails: boolean) {
    const event = await this.userEvent.needsPermission('canPublishEventResults');

    const proposal = await db.proposal.findUnique({
      where: {
        id: proposalId,
        eventId: event.id,
        publicationStatus: 'NOT_PUBLISHED',
        deliberationStatus: { in: ['ACCEPTED', 'REJECTED'] },
      },
      include: { speakers: true, formats: true },
    });
    if (!proposal) throw new ProposalNotFoundError();

    await db.proposal.update({
      where: { id: proposal.id },
      data: {
        publicationStatus: 'PUBLISHED',
        confirmationStatus: proposal.deliberationStatus === 'ACCEPTED' ? 'PENDING' : null,
      },
    });

    if (withEmails && proposal.deliberationStatus === 'ACCEPTED') {
      await sendEmail.trigger(ProposalAcceptedEmail.buildPayload({ event, proposal }));
    }

    if (withEmails && proposal.deliberationStatus === 'REJECTED') {
      await sendProposalRejectedEmailToSpeakers({ event, proposal });
    }
  }

  async statistics() {
    const event = await this.userEvent.needsPermission('canPublishEventResults');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const results = await db.proposal.groupBy({
      by: ['deliberationStatus', 'publicationStatus', 'confirmationStatus'],
      _count: { _all: true },
      where: { eventId: event.id, isDraft: false },
    });

    const deliberation = {
      total: sum(results),
      pending: sum(results.filter((p) => p.deliberationStatus === 'PENDING')),
      accepted: sum(results.filter((p) => p.deliberationStatus === 'ACCEPTED')),
      rejected: sum(results.filter((p) => p.deliberationStatus === 'REJECTED')),
    };

    const accepted = {
      published: sum(results.filter((p) => p.publicationStatus === 'PUBLISHED' && p.deliberationStatus === 'ACCEPTED')),
      notPublished: sum(
        results.filter((p) => p.publicationStatus === 'NOT_PUBLISHED' && p.deliberationStatus === 'ACCEPTED'),
      ),
    };

    const rejected = {
      published: sum(results.filter((p) => p.publicationStatus === 'PUBLISHED' && p.deliberationStatus === 'REJECTED')),
      notPublished: sum(
        results.filter((p) => p.publicationStatus === 'NOT_PUBLISHED' && p.deliberationStatus === 'REJECTED'),
      ),
    };

    const confirmations = {
      pending: sum(results.filter((p) => p.deliberationStatus === 'ACCEPTED' && p.confirmationStatus === 'PENDING')),
      confirmed: sum(
        results.filter((p) => p.deliberationStatus === 'ACCEPTED' && p.confirmationStatus === 'CONFIRMED'),
      ),
      declined: sum(results.filter((p) => p.deliberationStatus === 'ACCEPTED' && p.confirmationStatus === 'DECLINED')),
    };

    return { deliberation, accepted, rejected, confirmations };
  }
}

function sum(group: { _count: { _all: number } }[]) {
  return group.map(({ _count }) => _count._all).reduce((a, b) => a + b, 0);
}
