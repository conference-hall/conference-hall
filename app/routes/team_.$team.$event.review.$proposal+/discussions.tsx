import { type ActionFunctionArgs, json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { requireSession } from '~/libs/auth/session';
import { useUser } from '~/root';

import { Discussions } from './__components/Discussions';
import { addProposalMessage, getProposalMessages, removeProposalMessage } from './__server/messages.server';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');

  const messages = await getProposalMessages(params.event, params.proposal, userId);

  return json(messages);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');
  const form = await request.formData();

  const action = form.get('_action')?.toString();
  if (action === 'delete') {
    const messageId = form.get('messageId')?.toString();
    if (messageId) await removeProposalMessage(params.event, params.proposal, userId, messageId);
  } else {
    const comment = form.get('comment')?.toString();
    if (comment) await addProposalMessage(params.event, params.proposal, userId, comment);
  }
  return null;
};

export default function ProposaDiscussionsRoute() {
  const { user } = useUser();
  const messages = useLoaderData<typeof loader>();

  return <Discussions userId={user?.id} messages={messages} />;
}
