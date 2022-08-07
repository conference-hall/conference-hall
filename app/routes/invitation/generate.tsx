import { type InviteType } from '@prisma/client';
import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { sessionRequired } from '../../services/auth/auth.server';
import { mapErrorToResponse } from '../../services/errors';
import { generateInvitationLink } from '../../services/invitations/invitations.server';

export type InvitationLink = { link?: string };

export const action: ActionFunction = async ({ request }) => {
  const uid = await sessionRequired(request);
  const form = await request.formData();
  const type = form.get('_type') as InviteType;
  const id = form.get('_id') as string;

  try {
    const link = await generateInvitationLink(type, id, uid);
    return json<InvitationLink>({ link });
  } catch (err) {
    mapErrorToResponse(err);
  }
};
