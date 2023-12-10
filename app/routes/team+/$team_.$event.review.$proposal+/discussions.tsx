import { type ActionFunctionArgs, json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { ProposalReviewDiscussion } from '~/domains/organizer-cfp-reviews/ProposalReviewDiscussion.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { useUser } from '~/root.tsx';

import { DiscussionsPage } from './__components/discussions-page.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.team, 'Invalid team slug');
  invariant(params.proposal, 'Invalid proposal id');

  const discussions = ProposalReviewDiscussion.for(userId, params.team, params.event, params.proposal);
  const messages = await discussions.messages();

  return json(messages);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.team, 'Invalid team slug');
  invariant(params.proposal, 'Invalid proposal id');

  const discussions = ProposalReviewDiscussion.for(userId, params.team, params.event, params.proposal);

  const form = await request.formData();
  const action = form.get('_action')?.toString();
  if (action === 'delete') {
    const messageId = form.get('messageId')?.toString();
    if (messageId) await discussions.remove(messageId);
  } else {
    const comment = form.get('comment')?.toString();
    if (comment) await discussions.add(comment);
  }
  return null;
};

export default function ProposaDiscussionsRoute() {
  const { user } = useUser();
  const messages = useLoaderData<typeof loader>();

  return <DiscussionsPage userId={user?.id} messages={messages} />;
}
