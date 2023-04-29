import invariant from 'tiny-invariant';
import type { ActionArgs } from '@remix-run/node';
import { requireSession } from '~/libs/auth/session';
import { mapErrorToResponse } from '~/libs/errors';
import { addProposalComment, removeProposalComment } from './server/comments.server';

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.orga, 'Invalid organization slug');
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');
  const form = await request.formData();

  try {
    const action = form.get('_action')?.toString();
    if (action === 'delete') {
      const messageId = form.get('messageId')?.toString();
      if (messageId) await removeProposalComment(params.orga, params.event, params.proposal, userId, messageId);
    } else {
      const comment = form.get('comment')?.toString();
      if (comment) await addProposalComment(params.orga, params.event, params.proposal, userId, comment);
    }
    return null;
  } catch (e) {
    throw mapErrorToResponse(e);
  }
};
