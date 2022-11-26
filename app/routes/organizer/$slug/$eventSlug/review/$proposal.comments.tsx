import type { ActionArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { mapErrorToResponse } from '~/services/errors';
import { addProposalComment, removeProposalComment } from '~/services/organizer-review/comments.server';

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await sessionRequired(request);
  try {
    const { slug, eventSlug, proposal } = params;
    const form = await request.formData();
    const action = form.get('_action')?.toString();
    if (action === 'delete') {
      const messageId = form.get('messageId')?.toString();
      if (messageId) await removeProposalComment(slug!, eventSlug!, proposal!, uid, messageId);
    } else {
      const comment = form.get('comment')?.toString();
      if (comment) await addProposalComment(slug!, eventSlug!, proposal!, uid, comment);
    }
    return null;
  } catch (e) {
    throw mapErrorToResponse(e);
  }
};
