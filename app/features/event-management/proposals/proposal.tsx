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
import { LoadingActivities } from './components/detail/activity/loading-activities.tsx';
import { ProposalActivityFeed as Feed } from './components/detail/activity/proposal-activity-feed.tsx';
import { CategoriesSection } from './components/detail/metadata/categories-section.tsx';
import { FormatsSection } from './components/detail/metadata/formats-section.tsx';
import { SpeakersSection } from './components/detail/metadata/speakers-section.tsx';
import { TagsSection } from './components/detail/metadata/tags-section.tsx';
import { NavigationHeader } from './components/detail/navigation-header.tsx';
import { OtherProposalsDisclosure } from './components/detail/other-proposals-disclosure.tsx';
import { ReviewSidebar } from './components/detail/review/review-sidebar.tsx';
import { ActivityFeed } from './services/activity-feed.server.ts';
import { Comments } from './services/comments.server.ts';
import {
  ProposalSaveCategoriesSchema,
  ProposalSaveFormatsSchema,
  ProposalSaveSpeakersSchema,
  ProposalSaveTagsSchema,
  ProposalUpdateSchema,
} from './services/proposal-management.schema.server.ts';
import { ProposalManagement } from './services/proposal-management.server.ts';
import { CommentReactionSchema, ReviewUpdateDataSchema } from './services/proposal-review.schema.server.ts';
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

  // todo(proposal): use eveent speaker ids instead user ids
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

      const proposal = ProposalManagement.for(userId, params.team, params.event, params.proposal);
      await proposal.update(result.value);
      return toast('success', t('event-management.proposal-page.feedbacks.saved'));
    }
    case 'save-tags': {
      const result = parseWithZod(form, { schema: ProposalSaveTagsSchema });
      if (result.status !== 'success') return toast('error', t('error.global'));

      const proposal = ProposalManagement.for(userId, params.team, params.event, params.proposal);
      await proposal.saveTags(result.value);
      break;
    }
    case 'save-speakers': {
      const result = parseWithZod(form, { schema: ProposalSaveSpeakersSchema });
      if (result.status !== 'success') return toast('error', result?.error?.speakers?.[0] || t('error.global'));

      const proposal = ProposalManagement.for(userId, params.team, params.event, params.proposal);
      await proposal.saveSpeakers(result.value);
      break;
    }
    case 'save-formats': {
      const result = parseWithZod(form, { schema: ProposalSaveFormatsSchema });
      if (result.status !== 'success') return toast('error', t('error.global'));

      const proposal = ProposalManagement.for(userId, params.team, params.event, params.proposal);
      await proposal.saveFormats(result.value);
      break;
    }
    case 'save-categories': {
      const result = parseWithZod(form, { schema: ProposalSaveCategoriesSchema });
      if (result.status !== 'success') return toast('error', t('error.global'));

      const proposal = ProposalManagement.for(userId, params.team, params.event, params.proposal);
      await proposal.saveCategories(result.value);
      break;
    }
  }
  return null;
};

export default function ProposalReviewLayoutRoute({ params, loaderData, actionData: errors }: Route.ComponentProps) {
  const { team, event } = useCurrentEventTeam();
  const { canEditEvent, canEditEventProposals, canChangeProposalStatus } = team.userPermissions;
  const { proposal, pagination, activityPromise, otherProposalsPromise } = loaderData;

  const hasSpeakers = proposal.speakers.length > 0;
  const hasFormats = event.formats && event.formats.length > 0;
  const hasCategories = event.categories && event.categories.length > 0;

  return (
    <Page>
      <NavigationHeader {...pagination} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <TalkSection
            talk={proposal}
            errors={errors}
            event={event}
            canEditTalk={canEditEventProposals}
            canEditSpeakers={false}
            canArchive={false}
            showSpeakers={false}
            showFormats={false}
            showCategories={false}
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
            {hasSpeakers ? (
              <>
                <SpeakersSection
                  team={params.team}
                  event={params.event}
                  proposalId={params.proposal}
                  proposalSpeakers={proposal.speakers}
                  canEditEventProposals={canEditEventProposals}
                  className="space-y-3 p-4 lg:px-6"
                />
                <Divider />
              </>
            ) : null}

            {hasFormats ? (
              <>
                <FormatsSection
                  team={params.team}
                  event={params.event}
                  proposalId={params.proposal}
                  proposalFormats={proposal.formats}
                  eventFormats={event.formats}
                  multiple={event.formatsAllowMultiple}
                  canEditEventProposals={canEditEventProposals}
                  canEditEvent={canEditEvent}
                  className="space-y-3 p-4 lg:px-6"
                />
                <Divider />
              </>
            ) : null}

            {hasCategories ? (
              <>
                <CategoriesSection
                  team={params.team}
                  event={params.event}
                  proposalId={params.proposal}
                  proposalCategories={proposal.categories}
                  eventCategories={event.categories}
                  multiple={event.categoriesAllowMultiple}
                  canEditEventProposals={canEditEventProposals}
                  canEditEvent={canEditEvent}
                  className="space-y-3 p-4 lg:px-6"
                />
                <Divider />
              </>
            ) : null}

            <TagsSection
              team={params.team}
              event={params.event}
              proposalId={params.proposal}
              proposalTags={proposal.tags}
              eventTags={event.tags}
              canEditEventProposals={canEditEventProposals}
              canEditEvent={canEditEvent}
              className="space-y-3 p-4 pb-6 lg:px-6"
            />
          </Card>
        </div>
      </div>
    </Page>
  );
}
