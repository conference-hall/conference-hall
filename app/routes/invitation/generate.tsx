import { type InviteType } from '@prisma/client';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { sessionRequired } from '../../services/auth/auth.server';
import { mapErrorToResponse } from '../../services/errors';
import { generateLink } from '../../services/invitations/generate-link.server';

export const action = async ({ request }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  const form = await request.formData();
  const type = form.get('_type') as InviteType;
  const id = form.get('_id') as string;

  try {
    const link = await generateLink(type, id, uid);
    return json({ link });
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};
