import { db } from 'prisma/db.server.ts';
import z from 'zod';
import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import ProposalAcceptedEmail from '~/shared/emails/templates/speakers/proposal-accepted.tsx';
import ProposalRejectedEmail from '~/shared/emails/templates/speakers/proposal-rejected.tsx';
import { ForbiddenOperationError, ProposalNotFoundError } from '~/shared/errors.server.ts';

export const PublishResultFormSchema = z.object({
  type: z.enum(['ACCEPTED', 'REJECTED']),
  sendEmails: z.boolean().default(false),
});

export class Publication {
  constructor(private authorizedEvent: AuthorizedEvent) {}

  static for(authorizedEvent: AuthorizedEvent) {
    return new Publication(authorizedEvent);
  }

  async publishAll(status: 'ACCEPTED' | 'REJECTED', withEmails: boolean) {
    const { event, permissions } = this.authorizedEvent;
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();
    if (!permissions.canPublishEventResults) throw new ForbiddenOperationError();

    const proposals = await db.proposal.findMany({
      where: { eventId: event.id, publicationStatus: 'NOT_PUBLISHED', deliberationStatus: status, archivedAt: null },
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
      await Promise.all(
        proposals.map((proposal) => sendEmail.trigger(ProposalRejectedEmail.buildPayload({ event, proposal }))),
      );
    }
  }

  async publish(proposalId: string, withEmails: boolean) {
    const { event, permissions } = this.authorizedEvent;
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();
    if (!permissions.canPublishEventResults) throw new ForbiddenOperationError();

    const proposal = await db.proposal.findUnique({
      where: {
        id: proposalId,
        eventId: event.id,
        publicationStatus: 'NOT_PUBLISHED',
        deliberationStatus: { in: ['ACCEPTED', 'REJECTED'] },
        archivedAt: null,
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
      await sendEmail.trigger(ProposalRejectedEmail.buildPayload({ event, proposal }));
    }
  }

  async statistics() {
    const { event, permissions } = this.authorizedEvent;
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();
    if (!permissions.canPublishEventResults) throw new ForbiddenOperationError();

    const results = await db.proposal.groupBy({
      by: ['deliberationStatus', 'publicationStatus', 'confirmationStatus'],
      _count: { _all: true },
      where: { eventId: event.id, isDraft: false, archivedAt: null },
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
