import { parse } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useOutletContext, useParams } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { redirectWithToast, toast } from '~/libs/toasts/toast.server.ts';
import { useUser } from '~/root.tsx';
import { parseProposalsFilters, ProposalReviewDataSchema } from '~/routes/__types/proposal.ts';

import { ReviewHeader } from './__components/Header.tsx';
import { ReviewInfoSection } from './__components/ReviewInfoSection.tsx';
import { ReviewTabs } from './__components/Tabs.tsx';
import type { ProposalReview } from './__server/get-proposal-review.server.ts';
import { getProposalReview } from './__server/get-proposal-review.server.ts';
import { rateProposal } from './__server/review-proposal.server.ts';

export const meta = mergeMeta(() => [{ title: `Review proposal | Conference Hall` }]);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');

  const url = new URL(request.url);
  const filters = parseProposalsFilters(url.searchParams);
  const proposal = await getProposalReview(params.event, params.proposal, userId, filters);
  return json(proposal);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');
  const form = await request.formData();
  const nextPath = form.get('nextPath') as string;

  const result = parse(form, { schema: ProposalReviewDataSchema });
  if (result.value) {
    await rateProposal(params.event, params.proposal, userId, result.value);
    if (nextPath) {
      return redirectWithToast(nextPath, 'success', 'Review saved.');
    }
    return toast('success', 'Review saved.');
  }
  return null;
};

export default function ProposalReviewLayoutRoute() {
  const params = useParams();
  const { user } = useUser();

  const proposalReview = useLoaderData<typeof loader>();
  const { proposal, pagination } = proposalReview;
  const { you, summary } = proposal.reviews;

  const role = user?.teams.find((team) => team.slug === params.team)?.role;
  const canEditProposal = 'MEMBER' === role || 'OWNER' === role;

  return (
    <>
      <ReviewHeader title={proposal.title} pagination={pagination} canEditProposal={canEditProposal} />

      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:gap-8 lg:p-8">
        <div className="flex-1 space-y-4">
          <ReviewTabs
            speakersCount={proposal.speakers.length}
            reviewsCount={proposal.reviewsCount}
            messagesCount={proposal.messagesCount}
            displayReviews={Boolean(summary)}
          />

          <Outlet context={{ user, proposalReview }} />
        </div>

        <div className="w-full lg:w-fit">
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
