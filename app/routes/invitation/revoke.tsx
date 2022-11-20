import { type InviteType } from '@prisma/client';
import type { ActionFunction } from '@remix-run/node';
import { revokeLink } from '~/services/invitations/revoke-link.server';
import { sessionRequired } from '../../services/auth/auth.server';
import { mapErrorToResponse } from '../../services/errors';

export const action: ActionFunction = async ({ request }) => {
  const { uid } = await sessionRequired(request);
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
