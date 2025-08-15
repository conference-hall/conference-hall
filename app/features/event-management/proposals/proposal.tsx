import { parseWithZod } from '@conform-to/zod/v4';
import { Suspense } from 'react';
import { Await } from 'react-router';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Divider } from '~/design-system/divider.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { parseUrlFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';
import { TalkSection } from '~/features/speaker/talk-library/components/talk-section.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { i18n } from '~/shared/i18n/i18n.server.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import { Publication } from '../publication/services/publication.server.ts';
import type { Route } from './+types/proposal.ts';
import { OtherProposalsDisclosure } from './components/proposal-page/other-proposals-disclosure.tsx';
import { LoadingActivities } from './components/proposal-page/proposal-activity/loading-activities.tsx';
import { ProposalActivityFeed as Feed } from './components/proposal-page/proposal-activity/proposal-activity-feed.tsx';
import { ReviewHeader } from './components/proposal-page/review-header.tsx';
import { ReviewSidebar } from './components/proposal-page/review-sidebar.tsx';
import { CategoriesSection } from './components/proposal-page/sidebar/categories-section.tsx';
import { FormatsSection } from './components/proposal-page/sidebar/formats-section.tsx';
import { SpeakersSection } from './components/proposal-page/sidebar/speakers-section.tsx';
import { TagsSection } from './components/proposal-page/sidebar/tags-section.tsx';
import { ActivityFeed } from './services/activity-feed.server.ts';
import { Comments } from './services/comments.server.ts';
import {
  CommentReactionSchema,
  ProposalSaveTagsSchema,
  ProposalUpdateSchema,
  ReviewUpdateDataSchema,
} from './services/proposal-review.schema.server.ts';
import type { ProposalReviewData } from './services/proposal-review.server.ts';
import { ProposalReview } from './services/proposal-review.server.ts';
import { ProposalStatusSchema, ProposalStatusUpdater } from './services/proposal-status-updater.server.ts';

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

export default function ProposalReviewLayoutRoute({ params, loaderData, actionData: errors }: Route.ComponentProps) {
  const { team, event } = useCurrentEventTeam();
  const { canEditEvent, canEditEventProposals, canChangeProposalStatus } = team.userPermissions;
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
            canDeliberate={canChangeProposalStatus}
          />

          <Card as="section">
            <SpeakersSection
              team={params.team}
              event={params.event}
              proposalId={params.proposal}
              proposalSpeakers={proposal.speakers}
              canEditEventProposals={canEditEventProposals}
              error={errors?.speakers}
              className="space-y-3 p-4 lg:px-6"
            />

            <Divider />

            <FormatsSection
              team={params.team}
              event={params.event}
              proposalId={params.proposal}
              proposalFormats={proposal.formats}
              eventFormats={event.formats}
              canEditEventProposals={canEditEventProposals}
              canEditEvent={canEditEvent}
              error={errors?.formats}
              className="space-y-3 p-4 lg:px-6"
            />

            <Divider />

            <CategoriesSection
              team={params.team}
              event={params.event}
              proposalId={params.proposal}
              proposalCategories={proposal.categories}
              eventCategories={event.categories}
              canEditEventProposals={canEditEventProposals}
              canEditEvent={canEditEvent}
              error={errors?.categories}
              className="space-y-3 p-4 lg:px-6"
            />

            <Divider />

            <TagsSection
              team={params.team}
              event={params.event}
              proposalId={params.proposal}
              proposalTags={proposal.tags}
              eventTags={event.tags}
              canEditEventProposals={canEditEventProposals}
              canEditEvent={canEditEvent}
              className="space-y-3 p-4 lg:px-6"
            />
          </Card>
        </div>
      </div>
    </Page>
  );
}
