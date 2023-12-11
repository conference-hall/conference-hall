import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { ActivityFeed } from '~/domains/proposal-reviews/ActivityFeed.ts';
import { requireSession } from '~/libs/auth/session.ts';

import { ActivityFeed as Feed } from './__components/activity-feed.tsx';
import { ProposalPage } from './__components/proposal-page.tsx';
import { useProposalReview } from './_layout.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.proposal, 'Invalid proposal id');

  const activity = await new ActivityFeed(params.proposal).activity();
  console.log(activity);
  return json(activity);
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
