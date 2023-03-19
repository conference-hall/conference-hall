import { type InviteType } from '@prisma/client';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { sessionRequired } from '../../libs/auth/auth.server';
import { mapErrorToResponse } from '../../libs/errors';
import { generateLink } from './server/generate-link.server';

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
