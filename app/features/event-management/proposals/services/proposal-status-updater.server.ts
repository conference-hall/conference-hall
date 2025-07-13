import { db } from 'prisma/db.server.ts';
import { z } from 'zod/v4';
import type { DeliberationStatus } from '~/shared/types/proposals.types.ts';
import { UserEventAuthorization } from '~/shared/user/user-event-authorization.server.ts';
import type { ProposalsFilters } from './proposal-search-builder.schema.server.ts';
import { ProposalSearchBuilder } from './proposal-search-builder.server.ts';

export const ProposalStatusSchema = z.object({
  deliberationStatus: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']).optional(),
  confirmationStatus: z.enum(['PENDING', 'CONFIRMED', 'DECLINED']).optional(),
});

export const ProposalStatusBulkSchema = z.object({
  deliberationStatus: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']),
  selection: z.array(z.string()),
  allPagesSelected: z.stringbool().default(false),
});

type ProposalStatus = z.infer<typeof ProposalStatusSchema>;

export class ProposalStatusUpdater extends UserEventAuthorization {
  static for(userId: string, team: string, event: string) {
    return new ProposalStatusUpdater(userId, team, event);
  }

  async update(proposalIds: string[], { confirmationStatus, deliberationStatus }: ProposalStatus) {
    await this.needsPermission('canChangeProposalStatus');

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
    const event = await this.needsPermission('canChangeProposalStatus');

    const search = new ProposalSearchBuilder(event.slug, this.userId, filters);
    const proposalIds = await search.proposalsIds();

    return this.update(proposalIds, { deliberationStatus });
  }
}
