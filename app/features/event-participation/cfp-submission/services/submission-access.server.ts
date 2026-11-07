import { CfpNotOpenError } from '~/shared/errors.server.ts';
import { db } from '../../../../../prisma/db.server.ts';

type AccessEvent = { id: string; isCfpOpen: boolean };

export type SubmissionAccess = { canSubmit: boolean; viaPass: boolean };

export async function getSubmissionAccess(event: AccessEvent, userId?: string): Promise<SubmissionAccess> {
  if (event.isCfpOpen) return { canSubmit: true, viaPass: false };

  const holdsPass = Boolean(userId) && (await db.submissionPass.count({ where: { eventId: event.id, userId } })) > 0;

  return { canSubmit: holdsPass, viaPass: holdsPass };
}

export async function assertCanSubmit(event: AccessEvent, userId: string): Promise<SubmissionAccess> {
  const access = await getSubmissionAccess(event, userId);
  if (!access.canSubmit) throw new CfpNotOpenError();
  return access;
}
