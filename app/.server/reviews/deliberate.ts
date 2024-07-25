import { db } from 'prisma/db.server.ts';
import { z } from 'zod';

import type { DeliberationStatus } from '~/types/proposals.types';

import { UserEvent } from '../event-settings/user-event.ts';
import { ProposalSearchBuilder } from '../shared/proposal-search-builder.ts';
import type { ProposalsFilters } from '../shared/proposal-search-builder.types.ts';

export const DeliberateSchema = z.object({ status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']) });

export const DeliberateBulkSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']),
  selection: z.array(z.string()),
  allPagesSelected: z.enum(['true', 'false']).transform((v) => v === 'true'),
});

export class Deliberate {
  constructor(
    private userId: string,
    private userEvent: UserEvent,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new Deliberate(userId, userEvent);
  }

  async mark(proposalIds: string[], deliberationStatus: DeliberationStatus) {
    await this.userEvent.needsPermission('canDeliberateEventProposals');

    const result = await db.proposal.updateMany({
      where: { id: { in: proposalIds }, deliberationStatus: { not: deliberationStatus } },
      data: {
        deliberationStatus,
        publicationStatus: 'NOT_PUBLISHED',
        confirmationStatus: null,
      },
    });
    return result.count;
  }

  async markAll(filters: ProposalsFilters, deliberationStatus: DeliberationStatus) {
    const event = await this.userEvent.needsPermission('canDeliberateEventProposals');

    const search = new ProposalSearchBuilder(event.slug, this.userId, filters);
    const proposalIds = await search.proposalsIds();

    const result = await db.proposal.updateMany({
      where: { id: { in: proposalIds }, deliberationStatus: { not: deliberationStatus } },
      data: { deliberationStatus },
    });
    return result.count;
  }
}
