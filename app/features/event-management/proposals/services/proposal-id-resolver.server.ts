import { db } from 'prisma/db.server.ts';
import z from 'zod';
import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { ProposalNotFoundError } from '~/shared/errors.server.ts';

export async function resolveProposalId(authorizedEvent: AuthorizedEvent, proposalParam: string) {
  const result = z.coerce.number().safeParse(proposalParam);
  if (!result.success) return proposalParam;

  const proposal = await db.proposal.findUnique({
    select: { id: true },
    where: { proposalNumber_eventId: { proposalNumber: result.data, eventId: authorizedEvent.event.id } },
  });

  if (!proposal) throw new ProposalNotFoundError();

  return proposal.id;
}
