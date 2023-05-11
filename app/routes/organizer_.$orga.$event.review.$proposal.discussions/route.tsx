import { json, type ActionArgs, type LoaderArgs } from '@remix-run/node';
import { requireSession } from '~/libs/auth/session';
import invariant from 'tiny-invariant';
import { addProposalMessage, getProposalMessages, removeProposalMessage } from './server/messages.server';
import { useUser } from '~/root';
import { useLoaderData } from '@remix-run/react';
import { OrganizerDiscussions } from './components/OrganizerDiscussions';

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');

  const messages = await getProposalMessages(params.event, params.proposal, userId);

  return json(messages);
};

export const action = async ({ request, params }: ActionArgs) => {
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

  return <OrganizerDiscussions userId={user?.id} messages={messages} />;
}
