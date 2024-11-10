import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Await, useActionData, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Publication } from '~/.server/publications/publication.ts';
import { ActivityFeed } from '~/.server/reviews/activity-feed.ts';
import { Comments } from '~/.server/reviews/comments.ts';
import { Deliberate, DeliberateSchema } from '~/.server/reviews/deliberate.ts';
import type { ProposalReviewData } from '~/.server/reviews/proposal-review.ts';
import { ProposalReview } from '~/.server/reviews/proposal-review.ts';
import {
  CommentReactionSchema,
  ProposalSaveTagsSchema,
  ProposalUpdateSchema,
  ReviewUpdateDataSchema,
} from '~/.server/reviews/proposal-review.types.ts';
import { parseUrlFilters } from '~/.server/shared/proposal-search-builder.types.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { TalkSection } from '~/routes/__components/talks/talk-section.tsx';

import { Suspense } from 'react';
import { useCurrentTeam } from '~/routes/__components/contexts/team-context.tsx';
import { useEvent } from '../__components/use-event.tsx';
import { OtherProposalsDisclosure } from './__components/proposal-page/other-proposals-disclosure.tsx';
import { LoadingActivities } from './__components/proposal-page/proposal-activity/loading-activities.tsx';
import { ProposalActivityFeed as Feed } from './__components/proposal-page/proposal-activity/proposal-activity-feed.tsx';
import { ReviewHeader } from './__components/proposal-page/review-header.tsx';
import { ReviewSidebar } from './__components/proposal-page/review-sidebar.tsx';
import { TagsCard } from './__components/proposal-page/tags-card.tsx';

export type ProposalData = ProposalReviewData;

export const meta = mergeMeta(() => [{ title: 'Review proposal | Conference Hall' }]);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.team, 'Invalid team slug');
  invariant(params.proposal, 'Invalid proposal id');

  const filters = parseUrlFilters(request.url);
  const proposalReview = ProposalReview.for(userId, params.team, params.event, params.proposal);
  const activityFeed = ActivityFeed.for(userId, params.team, params.event, params.proposal);

  const activityPromise = activityFeed.activity();
  const proposal = await proposalReview.get();
  const otherProposalsPromise = proposalReview.getOtherProposals(proposal.speakers.map((s) => s.id));
  const pagination = await proposalReview.getPreviousAndNextReviews(filters);

  return { proposal, pagination, activityPromise, otherProposalsPromise };
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
    case 'react-to-comment': {
      const discussions = Comments.for(userId, params.team, params.event, params.proposal);
      const result = parseWithZod(form, { schema: CommentReactionSchema });
      if (result.status !== 'success') return toast('error', 'Something went wrong.');
      await discussions.reactToComment(result.value);
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
      if (result.status !== 'success') return result.error;

      const proposal = ProposalReview.for(userId, params.team, params.event, params.proposal);
      await proposal.update(result.value);
      return toast('success', 'Proposal saved.');
    }
    case 'save-tags': {
      const result = parseWithZod(form, { schema: ProposalSaveTagsSchema });
      if (result.status !== 'success') return toast('error', 'Something went wrong.');

      const proposal = ProposalReview.for(userId, params.team, params.event, params.proposal);
      await proposal.saveTags(result.value);
      break;
    }
  }
  return null;
};

export default function ProposalReviewLayoutRoute() {
  const currentTeam = useCurrentTeam();
  const { canEditEvent, canEditEventProposals, canDeliberateEventProposals } = currentTeam.userPermissions;

  const { event } = useEvent();

  const { proposal, pagination, activityPromise, otherProposalsPromise } = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  const hasFormats = proposal.formats && proposal.formats.length > 0;
  const hasCategories = proposal.categories && proposal.categories.length > 0;

  return (
    <Page>
      <ReviewHeader {...pagination} />

      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <TalkSection
              talk={proposal}
              errors={errors}
              event={event}
              canEditTalk={canEditEventProposals}
              canEditSpeakers={false}
              canArchive={false}
              showFormats={hasFormats}
              showCategories={hasCategories}
            >
              <Suspense fallback={null}>
                <Await resolve={otherProposalsPromise}>
                  {(proposals) => <OtherProposalsDisclosure proposals={proposals} />}
                </Await>
              </Suspense>
            </TalkSection>

            <Suspense fallback={<LoadingActivities />}>
              <Await resolve={activityPromise}>{(activity) => <Feed activity={activity} />}</Await>
            </Suspense>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <ReviewSidebar
              proposal={proposal}
              reviewEnabled={event.reviewEnabled}
              canDeliberate={canDeliberateEventProposals}
            />

            <TagsCard
              proposalId={proposal.id}
              eventTags={event.tags}
              proposalTags={proposal.tags}
              canEditProposalTags={canEditEventProposals}
              canEditEventTags={canEditEvent}
            />
          </div>
        </div>
      </div>
    </Page>
  );
}
