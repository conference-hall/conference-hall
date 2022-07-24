import { type InviteType } from '@prisma/client';
import type { ActionFunction } from '@remix-run/node';
import { requireUserSession } from '../../services/auth/auth.server';
import { mapErrorToResponse } from '../../services/errors';
import { revokeInvitationLink } from '../../services/invitations/invitations.server';

export const action: ActionFunction = async ({ request }) => {
  const uid = await requireUserSession(request);
  const form = await request.formData();
  const type = form.get('_type') as InviteType;
  const id = form.get('_id') as string;

  try {
    await revokeInvitationLink(type, id, uid);
  } catch (err) {
    mapErrorToResponse(err);
  }
  return null;
};
