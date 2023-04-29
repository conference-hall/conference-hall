import { type InviteType } from '@prisma/client';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { mapErrorToResponse } from '../../libs/errors';
import { generateLink } from './server/generate-link.server';
import { requireSession } from '~/libs/auth/session';

export const action = async ({ request }: LoaderArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  const type = form.get('_type') as InviteType;
  const id = form.get('_id') as string;

  try {
    const link = await generateLink(type, id, userId);
    return json({ link });
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};
