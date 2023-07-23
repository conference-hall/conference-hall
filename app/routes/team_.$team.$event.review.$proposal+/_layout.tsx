import { parse } from '@conform-to/zod';
import { TeamRole } from '@prisma/client';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Outlet, useLoaderData, useOutletContext, useParams } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Navbar } from '~/components/navbar/Navbar';
import { requireSession } from '~/libs/auth/session';
import { mergeMeta } from '~/libs/meta/merge-meta';
import { addToast } from '~/libs/toasts/toasts';
import { useUser } from '~/root';
import { parseProposalsFilters, ProposalReviewDataSchema } from '~/schemas/proposal';

import { ReviewHeader } from './components/Header';
import { ReviewInfoSection } from './components/ReviewInfoSection';
import { ReviewTabs } from './components/Tabs';
import type { ProposalReview } from './server/get-proposal-review.server';
import { getProposalReview } from './server/get-proposal-review.server';
import { rateProposal } from './server/review-proposal.server';

export const meta = mergeMeta(() => [{ title: `Review proposal | Conference Hall` }]);

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');

  const url = new URL(request.url);
  const filters = parseProposalsFilters(url.searchParams);
  const proposal = await getProposalReview(params.event, params.proposal, userId, filters);
  return json(proposal);
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');
  const form = await request.formData();
  const nextPath = form.get('nextPath') as string;

  const result = parse(form, { schema: ProposalReviewDataSchema });
  if (result.value) {
    await rateProposal(params.event, params.proposal, userId, result.value);
    if (nextPath) {
      return redirect(nextPath, await addToast(request, 'Review saved.'));
    }
    return json(null, await addToast(request, 'Review saved.'));
  }
  return null;
};

export default function ProposalReviewRoute() {
  const params = useParams();
  const { user } = useUser();

  const proposalReview = useLoaderData<typeof loader>();
  const { proposal, pagination } = proposalReview;
  const { you, summary } = proposal.reviews;

  const role = user?.teams.find((team) => team.slug === params.team)?.role;
  const canEditProposal = TeamRole.MEMBER === role || TeamRole.OWNER === role;

  return (
    <>
      <Navbar user={user} withSearch />

      <ReviewHeader title={proposal.title} pagination={pagination} canEditProposal={canEditProposal} />

      <div className="flex gap-8 px-8 py-8">
        <div className="flex-1 space-y-4">
          <ReviewTabs
            speakersCount={proposal.speakers.length}
            reviewsCount={proposal.reviewsCount}
            messagesCount={proposal.messagesCount}
            displayReviews={Boolean(summary)}
          />

          <Outlet context={{ user, proposalReview }} />
        </div>

        <div className="w-1/4 space-y-4">
          <ReviewInfoSection
            proposalId={proposal.id}
            userReview={you}
            review={summary}
            status={proposal.status}
            comments={proposal.comments}
            submittedAt={proposal.createdAt}
            reviewEnabled={proposalReview.reviewEnabled}
            nextId={pagination.nextId}
          />
        </div>
      </div>
    </>
  );
}

export function useProposalReview() {
  return useOutletContext<{ proposalReview: ProposalReview }>();
}
