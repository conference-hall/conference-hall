import { parseWithZod } from '@conform-to/zod';
import { Suspense } from 'react';
import { Await } from 'react-router';
import { Publication } from '~/.server/publications/publication.ts';
import { ActivityFeed } from '~/.server/reviews/activity-feed.ts';
import { Comments } from '~/.server/reviews/comments.ts';
import type { ProposalReviewData } from '~/.server/reviews/proposal-review.ts';
import { ProposalReview } from '~/.server/reviews/proposal-review.ts';
import {
  CommentReactionSchema,
  ProposalSaveTagsSchema,
  ProposalUpdateSchema,
  ReviewUpdateDataSchema,
} from '~/.server/reviews/proposal-review.types.ts';
import { ProposalStatusSchema, ProposalStatusUpdater } from '~/.server/reviews/proposal-status-updater.ts';
import { parseUrlFilters } from '~/.server/shared/proposal-search-builder.types.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context.tsx';
import { useCurrentTeam } from '~/routes/components/contexts/team-context.tsx';
import { TalkSection } from '~/routes/components/talks/talk-section.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { i18n } from '~/shared/i18n/i18n.server.ts';
import { OtherProposalsDisclosure } from '../components/proposal-page/other-proposals-disclosure.tsx';
import { LoadingActivities } from '../components/proposal-page/proposal-activity/loading-activities.tsx';
import { ProposalActivityFeed as Feed } from '../components/proposal-page/proposal-activity/proposal-activity-feed.tsx';
import { ReviewHeader } from '../components/proposal-page/review-header.tsx';
import { ReviewSidebar } from '../components/proposal-page/review-sidebar.tsx';
import { TagsCard } from '../components/proposal-page/tags-card.tsx';
import type { Route } from './+types/$proposal.ts';

export type ProposalData = ProposalReviewData;

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Review proposal | Conference Hall' }]);
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const filters = parseUrlFilters(request.url);
  const proposalReview = ProposalReview.for(userId, params.team, params.event, params.proposal);
  const activityFeed = ActivityFeed.for(userId, params.team, params.event, params.proposal);

  const activityPromise = activityFeed.activity();
  const proposal = await proposalReview.get();
  const otherProposalsPromise = proposalReview.getOtherProposals(
    proposal.speakers.map((s) => s.userId).filter((s) => s !== null),
  );
  const pagination = await proposalReview.getPreviousAndNextReviews(filters);

  return { proposal, pagination, activityPromise, otherProposalsPromise };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);
  const form = await request.formData();
  const intent = form.get('intent') as string;

  switch (intent) {
    case 'add-review': {
      const result = parseWithZod(form, { schema: ReviewUpdateDataSchema });
      if (result.status !== 'success') return toast('error', t('error.global'));
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
      if (result.status !== 'success') return toast('error', t('error.global'));
      await discussions.reactToComment(result.value);
      break;
    }
    case 'change-proposal-status': {
      const result = parseWithZod(form, { schema: ProposalStatusSchema });
      if (result.status !== 'success') return toast('error', t('error.global'));
      const deliberate = ProposalStatusUpdater.for(userId, params.team, params.event);
      await deliberate.update([params.proposal], result.value);
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
      return toast('success', t('event-management.proposal-page.feedbacks.saved'));
    }
    case 'save-tags': {
      const result = parseWithZod(form, { schema: ProposalSaveTagsSchema });
      if (result.status !== 'success') return toast('error', t('error.global'));

      const proposal = ProposalReview.for(userId, params.team, params.event, params.proposal);
      await proposal.saveTags(result.value);
      break;
    }
  }
  return null;
};

export default function ProposalReviewLayoutRoute({ loaderData, actionData: errors }: Route.ComponentProps) {
  const currentTeam = useCurrentTeam();
  const currentEvent = useCurrentEvent();
  const { canEditEvent, canEditEventProposals, canChangeProposalStatus } = currentTeam.userPermissions;
  const { proposal, pagination, activityPromise, otherProposalsPromise } = loaderData;
  const hasFormats = proposal.formats && proposal.formats.length > 0;
  const hasCategories = proposal.categories && proposal.categories.length > 0;

  return (
    <Page>
      <ReviewHeader {...pagination} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <TalkSection
            talk={proposal}
            errors={errors}
            event={currentEvent}
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
            reviewEnabled={currentEvent.reviewEnabled}
            canDeliberate={canChangeProposalStatus}
          />

          <TagsCard
            proposalId={proposal.id}
            eventTags={currentEvent.tags}
            proposalTags={proposal.tags}
            canEditProposalTags={canEditEventProposals}
            canEditEventTags={canEditEvent}
          />
        </div>
      </div>
    </Page>
  );
}
