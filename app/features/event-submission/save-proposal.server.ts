import { ActionFunction, redirect } from 'remix';
import { db } from '../../services/db';
import { requireUserSession } from '../auth/auth.server';

export const saveProposal: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  if (!uid) return redirect('/', 401);

  const { talkId } = params;

  const form = await request.formData();
  const title = form.get('title')?.toString() || 'default title';
  const abstract = form.get('abstract')?.toString() || 'default desc';
  const references = form.get('references')?.toString();

  await db.talk.upsert({
    where: { id: talkId },
    update: {
      title,
      abstract,
      references,
    },
    create: {
      title,
      abstract,
      references,
      creator: { connect: { id: uid } },
      speakers: { connect: [{ id: uid }] },
    },
  });

  return redirect(`/${params.eventSlug}/submit`);
};
