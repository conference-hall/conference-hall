import invariant from 'tiny-invariant';
import type { ActionArgs } from '@remix-run/node';
import { requireSession } from '~/libs/auth/session';
import { addProposalComment, removeProposalComment } from './server/comments.server';

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');
  const form = await request.formData();

  const action = form.get('_action')?.toString();
  if (action === 'delete') {
    const messageId = form.get('messageId')?.toString();
    if (messageId) await removeProposalComment(params.event, params.proposal, userId, messageId);
  } else {
    const comment = form.get('comment')?.toString();
    if (comment) await addProposalComment(params.event, params.proposal, userId, comment);
  }
  return null;
};
