import { type InviteType } from '@prisma/client';
import type { ActionFunction } from '@remix-run/node';
import { revokeLink } from '~/routes/invitation.revoke/server/revoke-link.server';
import { mapErrorToResponse } from '../../libs/errors';
import { requireSession } from '~/libs/auth/cookies';

export const action: ActionFunction = async ({ request }) => {
  const { uid } = await requireSession(request);
  const form = await request.formData();
  const type = form.get('_type') as InviteType;
  const id = form.get('_id') as string;

  try {
    await revokeLink(type, id, uid);
  } catch (err) {
    mapErrorToResponse(err);
  }
  return null;
};
