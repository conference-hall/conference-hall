import { EventNotFoundError } from '~/shared/errors.server.ts';
import { db } from '../../../../../prisma/db.server.ts';

type AccessEvent = { id: string; isCfpOpen: boolean };

export type SubmissionAccess = { canSubmit: boolean; maxProposalsApplies: boolean };

export async function getSubmissionAccess(event: AccessEvent, _userId: string): Promise<SubmissionAccess> {
  return { canSubmit: event.isCfpOpen, maxProposalsApplies: event.isCfpOpen };
}

export async function getSubmissionAccessForSlug(eventSlug: string, userId: string): Promise<SubmissionAccess> {
  const event = await db.event.findUnique({ where: { slug: eventSlug } });
  if (!event) throw new EventNotFoundError();
  return getSubmissionAccess(event, userId);
}
