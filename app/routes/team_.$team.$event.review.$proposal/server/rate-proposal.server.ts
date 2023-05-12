import { db } from '~/libs/db';
import { DeliberationDisabledError } from '~/libs/errors';
import type { ProposalRatingData } from '~/schemas/proposal';
import { allowedForEvent } from '~/shared-server/organizations/check-user-role.server';

export async function rateProposal(eventSlug: string, proposalId: string, userId: string, data: ProposalRatingData) {
  const event = await allowedForEvent(eventSlug, userId);

  if (!event.deliberationEnabled) throw new DeliberationDisabledError();

  await db.rating.upsert({
    where: { userId_proposalId: { userId: userId, proposalId } },
    update: data,
    create: { userId: userId, proposalId, ...data },
  });
}
