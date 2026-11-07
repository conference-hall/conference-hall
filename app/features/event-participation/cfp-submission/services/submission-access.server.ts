import { db } from '../../../../../prisma/db.server.ts';

type AccessEvent = { id: string; isCfpOpen: boolean };

export type SubmissionAccess = { canSubmit: boolean; maxProposalsApplies: boolean; viaPass: boolean };

export async function getSubmissionAccess(event: AccessEvent, userId?: string): Promise<SubmissionAccess> {
  if (event.isCfpOpen) return { canSubmit: true, maxProposalsApplies: true, viaPass: false };

  const holdsPass = Boolean(userId) && (await db.submissionPass.count({ where: { eventId: event.id, userId } })) > 0;

  return { canSubmit: holdsPass, maxProposalsApplies: false, viaPass: holdsPass };
}
