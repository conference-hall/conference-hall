import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { ActivityFeed } from '~/domains/proposal-reviews/ActivityFeed.ts';
import { Comments } from '~/domains/proposal-reviews/Comments.ts';
import { requireSession } from '~/libs/auth/session.ts';

import { ActivityFeed as Feed } from './__components/activity-feed.tsx';
import { ProposalPage } from './__components/proposal-page.tsx';
import { useProposalReview } from './_layout.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.team, 'Invalid team slug');
  invariant(params.proposal, 'Invalid proposal id');

  const activity = await ActivityFeed.for(userId, params.team, params.event, params.proposal).activity();
  return json(activity);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.team, 'Invalid team slug');
  invariant(params.proposal, 'Invalid proposal id');

  const form = await request.formData();
  const intent = form.get('intent') as string;

  switch (intent) {
    case 'add-comment': {
      const discussions = Comments.for(userId, params.team, params.event, params.proposal);
      const comment = form.get('comment');
      if (comment) await discussions.add(comment.toString());
      break;
    }
    case 'remove-comment': {
      const discussions = Comments.for(userId, params.team, params.event, params.proposal);
      const commentId = form.get('commentId');
      if (commentId) await discussions.remove(commentId.toString());
      break;
    }
  }
  return null;
};

export default function ProposalReviewRoute() {
  const activity = useLoaderData<typeof loader>();
  const { proposal } = useProposalReview();

  return (
    <>
      <ProposalPage proposal={proposal} />
      <Feed activity={activity} />
    </>
  );
}
