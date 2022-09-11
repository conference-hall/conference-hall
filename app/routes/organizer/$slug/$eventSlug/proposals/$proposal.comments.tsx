import type { ActionArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { mapErrorToResponse } from '~/services/errors';
import { addProposalComment } from '~/services/organizers/event.server';

export const action = async ({ request, params }: ActionArgs) => {
  const uid = await sessionRequired(request);
  try {
    const form = await request.formData();
    const comment = form.get('comment')?.toString();
    if (comment) await addProposalComment(params.eventSlug!, params.proposal!, uid, comment);
    return null;
  } catch (e) {
    throw mapErrorToResponse(e);
  }
};
