import { z } from 'zod';
import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import type { DeliberationStatus } from '~/shared/types/proposals.types.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import type { ProposalsFilters } from './proposal-search-builder.schema.server.ts';
import { db } from '../../../../../prisma/db.server.ts';
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

export class ProposalStatusUpdater {
  constructor(private authorizedEvent: AuthorizedEvent) {}

  static for(authorizedEvent: AuthorizedEvent) {
    return new ProposalStatusUpdater(authorizedEvent);
  }

  async update(proposalIds: string[], { confirmationStatus, deliberationStatus }: ProposalStatus) {
    const { permissions } = this.authorizedEvent;
    if (!permissions.canChangeProposalStatus) throw new ForbiddenOperationError();

    if (confirmationStatus) {
      const result = await db.proposal.updateMany({
        where: { id: { in: proposalIds }, archivedAt: null },
        data: { deliberationStatus: 'ACCEPTED', publicationStatus: 'PUBLISHED', confirmationStatus },
      });
      return result.count;
    }

    if (deliberationStatus) {
      const result = await db.proposal.updateMany({
        where: { id: { in: proposalIds }, deliberationStatus: { not: deliberationStatus }, archivedAt: null },
        data: { deliberationStatus, publicationStatus: 'NOT_PUBLISHED', confirmationStatus: null },
      });
      return result.count;
    }

    return 0;
  }

  async updateAll(filters: ProposalsFilters, deliberationStatus: DeliberationStatus) {
    const { event, userId, permissions } = this.authorizedEvent;
    if (!permissions.canChangeProposalStatus) throw new ForbiddenOperationError();

    const search = new ProposalSearchBuilder(event.id, userId, filters);
    const proposalIds = await search.proposalIds();

    return this.update(proposalIds, { deliberationStatus });
  }

  async archive(proposalIds: string[]) {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canChangeProposalStatus) throw new ForbiddenOperationError();

    const result = await db.proposal.updateMany({
      where: { id: { in: proposalIds }, eventId: event.id, archivedAt: null },
      data: { archivedAt: new Date() },
    });
    return result.count;
  }

  async restore(proposalIds: string[]) {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canChangeProposalStatus) throw new ForbiddenOperationError();

    const result = await db.proposal.updateMany({
      where: { id: { in: proposalIds }, eventId: event.id, archivedAt: { not: null } },
      data: { archivedAt: null },
    });
    return result.count;
  }
}
