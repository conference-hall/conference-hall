import { db } from 'prisma/db.server.ts';
import { z } from 'zod';
import type { DeliberationStatus } from '~/types/proposals.types.ts';
import { UserEvent } from '../event-settings/user-event.ts';
import { ProposalSearchBuilder } from '../shared/proposal-search-builder.ts';
import type { ProposalsFilters } from '../shared/proposal-search-builder.types.ts';

export const ProposalStatusSchema = z.object({
  deliberationStatus: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']).optional(),
  confirmationStatus: z.enum(['PENDING', 'CONFIRMED', 'DECLINED']).optional(),
});

export const ProposalStatusBulkSchema = z.object({
  deliberationStatus: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']),
  selection: z.array(z.string()),
  allPagesSelected: z.enum(['true', 'false']).transform((v) => v === 'true'),
});

type ProposalStatus = z.infer<typeof ProposalStatusSchema>;

export class ProposalStatusUpdater {
  constructor(
    private userId: string,
    private userEvent: UserEvent,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new ProposalStatusUpdater(userId, userEvent);
  }

  async update(proposalIds: string[], { confirmationStatus, deliberationStatus }: ProposalStatus) {
    await this.userEvent.needsPermission('canChangeProposalStatus');

    if (confirmationStatus) {
      const result = await db.proposal.updateMany({
        where: { id: { in: proposalIds } },
        data: { deliberationStatus: 'ACCEPTED', publicationStatus: 'PUBLISHED', confirmationStatus },
      });
      return result.count;
    }

    if (deliberationStatus) {
      const result = await db.proposal.updateMany({
        where: { id: { in: proposalIds }, deliberationStatus: { not: deliberationStatus } },
        data: { deliberationStatus, publicationStatus: 'NOT_PUBLISHED', confirmationStatus: null },
      });
      return result.count;
    }

    return 0;
  }

  async updateAll(filters: ProposalsFilters, deliberationStatus: DeliberationStatus) {
    const event = await this.userEvent.needsPermission('canChangeProposalStatus');

    const search = new ProposalSearchBuilder(event.slug, this.userId, filters);
    const proposalIds = await search.proposalsIds();

    return this.update(proposalIds, { deliberationStatus });
  }
}
