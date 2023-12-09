import { parse } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useOutletContext, useParams } from '@remix-run/react';
import invariant from 'tiny-invariant';

import type { ProposalReviewData } from '~/domains/organizer-cfp-reviews/ProposalReview.ts';
import { ProposalReview } from '~/domains/organizer-cfp-reviews/ProposalReview.ts';
import { ReviewUpdateDataSchema } from '~/domains/organizer-cfp-reviews/ProposalReview.types.ts';
import type { EventData } from '~/domains/organizer-event-settings/UserEvent.ts';
import { UserEvent } from '~/domains/organizer-event-settings/UserEvent.ts';
import { parseUrlFilters } from '~/domains/shared/ProposalSearchBuilder.types.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { redirectWithToast, toast } from '~/libs/toasts/toast.server.ts';
import { useUser } from '~/root.tsx';

import { ReviewHeader } from './__components/Header.tsx';
import { ReviewInfoSection } from './__components/ReviewInfoSection.tsx';
import { ReviewTabs } from './__components/Tabs.tsx';

export const meta = mergeMeta(() => [{ title: `Review proposal | Conference Hall` }]);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.team, 'Invalid team slug');
  invariant(params.proposal, 'Invalid proposal id');

  const event = await UserEvent.for(userId, params.team, params.event).get();

  const filters = parseUrlFilters(request.url);
  const review = ProposalReview.for(userId, params.team, params.event, params.proposal);
  const proposal = await review.get();
  const pagination = await review.getPreviousAndNextReviews(filters);

  return json({ event, proposal, pagination });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.team, 'Invalid team slug');
  invariant(params.proposal, 'Invalid proposal id');

  const form = await request.formData();
  const result = parse(form, { schema: ReviewUpdateDataSchema });
  if (!result.value) return toast('error', 'Something went wrong.');

  const proposalReview = ProposalReview.for(userId, params.team, params.event, params.proposal);
  await proposalReview.addReview(result.value);

  const nextPath = form.get('nextPath') as string;
  if (nextPath) return redirectWithToast(nextPath, 'success', 'Review saved.');
  return toast('success', 'Review saved.');
};

export default function ProposalReviewLayoutRoute() {
  const params = useParams();
  const { user } = useUser();

  const { event, proposal, pagination } = useLoaderData<typeof loader>();
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

          <Outlet context={{ user, event, proposal }} />
        </div>

        <div className="w-full lg:w-fit">
          <ReviewInfoSection
            proposalId={proposal.id}
            userReview={you}
            review={summary}
            deliberationStatus={proposal.deliberationStatus}
            comments={proposal.comments}
            submittedAt={proposal.createdAt}
            reviewEnabled={event.reviewEnabled}
            nextId={pagination.nextId}
          />
        </div>
      </div>
    </>
  );
}

export function useProposalEvent() {
  return useOutletContext<{ event: EventData }>();
}

export function useProposalReview() {
  return useOutletContext<{ proposal: ProposalReviewData }>();
}
