import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { defer, json } from '@remix-run/node';
import { Await, useActionData, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { Publication } from '~/.server/publications/publication.ts';
import { ActivityFeed } from '~/.server/reviews/activity-feed.ts';
import { Comments } from '~/.server/reviews/comments.ts';
import { Deliberate, DeliberateSchema } from '~/.server/reviews/deliberate.ts';
import type { ProposalReviewData } from '~/.server/reviews/proposal-review.ts';
import { ProposalReview } from '~/.server/reviews/proposal-review.ts';
import { ProposalUpdateSchema, ReviewUpdateDataSchema } from '~/.server/reviews/proposal-review.types.ts';
import { parseUrlFilters } from '~/.server/shared/proposal-search-builder.types.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { TalkSection } from '~/routes/__components/talks/talk-section.tsx';

import { Suspense } from 'react';
import { useTeam } from '../../__components/use-team.tsx';
import { LoadingActivities } from './__components/proposal-page/proposal-activity/loading-activities.tsx';
import { ProposalActivityFeed as Feed } from './__components/proposal-page/proposal-activity/proposal-activity-feed.tsx';
import { ReviewHeader } from './__components/proposal-page/review-header.tsx';
import { ReviewSidebar } from './__components/proposal-page/review-sidebar.tsx';

export type ProposalData = ProposalReviewData;

export const meta = mergeMeta(() => [{ title: 'Review proposal | Conference Hall' }]);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.team, 'Invalid team slug');
  invariant(params.proposal, 'Invalid proposal id');

  const activityPromise = ActivityFeed.for(userId, params.team, params.event, params.proposal).activity();

  const filters = parseUrlFilters(request.url);
  const userEvent = UserEvent.for(userId, params.team, params.event);
  const proposalReview = ProposalReview.for(userId, params.team, params.event, params.proposal);

  const [event, proposal, pagination] = await Promise.all([
    userEvent.get(),
    proposalReview.get(),
    proposalReview.getPreviousAndNextReviews(filters),
  ]);

  return defer({ event, proposal, pagination, activityPromise });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.team, 'Invalid team slug');
  invariant(params.proposal, 'Invalid proposal id');

  const form = await request.formData();
  const intent = form.get('intent') as string;

  switch (intent) {
    case 'add-review': {
      const result = parseWithZod(form, { schema: ReviewUpdateDataSchema });
      if (result.status !== 'success') return toast('error', 'Something went wrong.');
      const review = ProposalReview.for(userId, params.team, params.event, params.proposal);
      await review.addReview(result.value);
      break;
    }
    case 'add-comment': {
      const discussions = Comments.for(userId, params.team, params.event, params.proposal);
      const comment = form.get('comment');
      if (comment) await discussions.add(comment.toString());
      break;
    }
    case 'delete-comment': {
      const discussions = Comments.for(userId, params.team, params.event, params.proposal);
      const commentId = form.get('commentId');
      if (commentId) await discussions.remove(commentId.toString());
      break;
    }
    case 'change-deliberation-status': {
      const result = parseWithZod(form, { schema: DeliberateSchema });
      if (result.status !== 'success') return toast('error', 'Something went wrong.');
      const deliberate = Deliberate.for(userId, params.team, params.event);
      await deliberate.mark([params.proposal], result.value.status);
      break;
    }
    case 'publish-results': {
      const result = Publication.for(userId, params.team, params.event);
      await result.publish(params.proposal, form.get('send-email') === 'on');
      break;
    }
    case 'edit-talk': {
      const result = parseWithZod(form, { schema: ProposalUpdateSchema });
      if (result.status !== 'success') return json(result.error);

      const proposal = ProposalReview.for(userId, params.team, params.event, params.proposal);
      await proposal.update(result.value);
      return toast('success', 'Proposal saved.');
    }
  }
  return null;
};

export default function ProposalReviewLayoutRoute() {
  const { team } = useTeam();
  const { event, proposal, pagination, activityPromise } = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  const hasFormats = proposal.formats && proposal.formats.length > 0;
  const hasCategories = proposal.categories && proposal.categories.length > 0;

  return (
    <Page>
      <ReviewHeader {...pagination} />

      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
          <div className="space-y-4 lg:col-span-7">
            <TalkSection
              talk={proposal}
              errors={errors}
              event={event}
              canEditTalk={team.userPermissions.canEditEventProposals}
              canEditSpeakers={false}
              canArchive={false}
              showFormats={hasFormats}
              showCategories={hasCategories}
              referencesOpen
            />

            <Suspense fallback={<LoadingActivities />}>
              <Await resolve={activityPromise}>{(activity) => <Feed activity={activity} />}</Await>
            </Suspense>
          </div>

          <div className="lg:col-span-3">
            <ReviewSidebar
              proposal={proposal}
              reviewEnabled={event.reviewEnabled}
              canDeliberate={team.userPermissions.canDeliberateEventProposals}
            />
          </div>
        </div>
      </div>
    </Page>
  );
}
