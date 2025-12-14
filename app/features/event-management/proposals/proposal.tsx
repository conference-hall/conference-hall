import { parseWithZod } from '@conform-to/zod/v4';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Await } from 'react-router';
import { useUserTeamPermissions } from '~/app-platform/components/user-context.tsx';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { ActivityFeed } from '~/design-system/activity-feed/activity-feed.tsx';
import { Divider } from '~/design-system/divider.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { Text } from '~/design-system/typography.tsx';
import { ConversationDrawer } from '~/features/conversations/components/conversation-drawer.tsx';
import {
  ConversationMessageDeleteSchema,
  ConversationMessageReactSchema,
  ConversationMessageSaveSchema,
} from '~/features/conversations/services/conversation.schema.server.ts';
import { ProposalConversationForOrganizers } from '~/features/conversations/services/proposal-conversation-for-organizers.server.ts';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { parseUrlFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';
import { TalkSection } from '~/features/speaker/talk-library/components/talk-section.tsx';
import { getRequiredAuthUser } from '~/shared/auth/auth.middleware.ts';
import { useFlag } from '~/shared/feature-flags/flags-context.tsx';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import { Publication } from '../publication/services/publication.server.ts';
import type { Route } from './+types/proposal.ts';
import { ProposalActivityFeed } from './components/detail/activity/proposal-activity-feed.tsx';
import { CategoriesSection } from './components/detail/metadata/categories-section.tsx';
import { FormatsSection } from './components/detail/metadata/formats-section.tsx';
import { SpeakersSection } from './components/detail/metadata/speakers-section.tsx';
import { TagsSection } from './components/detail/metadata/tags-section.tsx';
import { NavigationHeader } from './components/detail/navigation-header.tsx';
import { OtherProposalsDisclosure } from './components/detail/other-proposals-disclosure.tsx';
import { ProposalActionsMenu } from './components/detail/proposal-actions-menu.tsx';
import { ReviewSidebar } from './components/detail/review/review-sidebar.tsx';
import { ActivityFeed as ActivityFeedService } from './services/activity-feed.server.ts';
import { CommentReactionSchema, CommentSaveSchema } from './services/comments.schema.server.ts';
import { Comments } from './services/comments.server.ts';
import {
  ProposalSaveCategoriesSchema,
  ProposalSaveFormatsSchema,
  ProposalSaveSpeakersSchema,
  ProposalSaveTagsSchema,
  ProposalUpdateSchema,
} from './services/proposal-management.schema.server.ts';
import { ProposalManagement } from './services/proposal-management.server.ts';
import { ReviewUpdateDataSchema } from './services/proposal-review.schema.server.ts';
import type { ProposalReviewData } from './services/proposal-review.server.ts';
import { ProposalReview } from './services/proposal-review.server.ts';
import { ProposalStatusSchema, ProposalStatusUpdater } from './services/proposal-status-updater.server.ts';

export type ProposalData = ProposalReviewData;

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Review proposal | Conference Hall' }]);
};

export const loader = async ({ request, params, context }: Route.LoaderArgs) => {
  const authUser = getRequiredAuthUser(context);
  const filters = parseUrlFilters(request.url);

  const proposalReview = ProposalReview.for(authUser.id, params.team, params.event, params.proposal);
  const activityFeed = ActivityFeedService.for(authUser.id, params.team, params.event, params.proposal);
  const speakerProposalConversation = ProposalConversationForOrganizers.for(
    authUser.id,
    params.team,
    params.event,
    params.proposal,
  );

  const activityPromise = Promise.all([activityFeed.activity(), speakerProposalConversation.getConversation()]);
  const proposal = await proposalReview.get();
  const otherProposalsPromise = proposalReview.getOtherProposals(proposal.speakers.map((s) => s.id));
  const pagination = await proposalReview.getPreviousAndNextReviews(filters);

  return { proposal, pagination, activityPromise, otherProposalsPromise };
};

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const authUser = getRequiredAuthUser(context);

  const i18n = getI18n(context);
  const form = await request.formData();
  const intent = form.get('intent') as string;

  switch (intent) {
    case 'add-review': {
      const result = parseWithZod(form, { schema: ReviewUpdateDataSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));
      const review = ProposalReview.for(authUser.id, params.team, params.event, params.proposal);
      await review.addReview(result.value);
      break;
    }
    case 'save-comment': {
      const discussions = Comments.for(authUser.id, params.team, params.event, params.proposal);
      const result = parseWithZod(form, { schema: CommentSaveSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));
      await discussions.save(result.value);
      break;
    }
    case 'delete-comment': {
      const discussions = Comments.for(authUser.id, params.team, params.event, params.proposal);
      const commentId = form.get('id');
      if (commentId) await discussions.remove(commentId.toString());
      break;
    }
    case 'react-comment': {
      const discussions = Comments.for(authUser.id, params.team, params.event, params.proposal);
      const result = parseWithZod(form, { schema: CommentReactionSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));
      await discussions.reactToComment(result.value);
      break;
    }
    case 'save-message': {
      const conversation = ProposalConversationForOrganizers.for(
        authUser.id,
        params.team,
        params.event,
        params.proposal,
      );
      const result = parseWithZod(form, { schema: ConversationMessageSaveSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));
      await conversation.saveMessage(result.value);
      break;
    }
    case 'react-message': {
      const conversation = ProposalConversationForOrganizers.for(
        authUser.id,
        params.team,
        params.event,
        params.proposal,
      );
      const result = parseWithZod(form, { schema: ConversationMessageReactSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));
      await conversation.reactMessage(result.value);
      break;
    }
    case 'delete-message': {
      const conversation = ProposalConversationForOrganizers.for(
        authUser.id,
        params.team,
        params.event,
        params.proposal,
      );
      const result = parseWithZod(form, { schema: ConversationMessageDeleteSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));
      await conversation.deleteMessage(result.value);
      break;
    }
    case 'change-proposal-status': {
      const result = parseWithZod(form, { schema: ProposalStatusSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));
      const deliberate = ProposalStatusUpdater.for(authUser.id, params.team, params.event);
      await deliberate.update([params.proposal], result.value);
      break;
    }
    case 'publish-results': {
      const result = Publication.for(authUser.id, params.team, params.event);
      await result.publish(params.proposal, form.get('send-email') === 'on');
      break;
    }
    case 'edit-talk': {
      const result = parseWithZod(form, { schema: ProposalUpdateSchema });
      if (result.status !== 'success') return result.error;

      const proposal = ProposalManagement.for(authUser.id, params.team, params.event, params.proposal);
      await proposal.update(result.value);
      return toast('success', i18n.t('event-management.proposal-page.feedbacks.saved'));
    }
    case 'save-tags': {
      const result = parseWithZod(form, { schema: ProposalSaveTagsSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));

      const proposal = ProposalManagement.for(authUser.id, params.team, params.event, params.proposal);
      await proposal.saveTags(result.value);
      break;
    }
    case 'save-speakers': {
      const result = parseWithZod(form, { schema: ProposalSaveSpeakersSchema });
      if (result.status !== 'success') return toast('error', result?.error?.speakers?.[0] || i18n.t('error.global'));

      const proposal = ProposalManagement.for(authUser.id, params.team, params.event, params.proposal);
      await proposal.saveSpeakers(result.value);
      break;
    }
    case 'save-formats': {
      const result = parseWithZod(form, { schema: ProposalSaveFormatsSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));

      const proposal = ProposalManagement.for(authUser.id, params.team, params.event, params.proposal);
      await proposal.saveFormats(result.value);
      break;
    }
    case 'save-categories': {
      const result = parseWithZod(form, { schema: ProposalSaveCategoriesSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));

      const proposal = ProposalManagement.for(authUser.id, params.team, params.event, params.proposal);
      await proposal.saveCategories(result.value);
      break;
    }
    case 'archive-proposal': {
      const proposalStatus = ProposalStatusUpdater.for(authUser.id, params.team, params.event);
      await proposalStatus.archive([params.proposal]);
      return toast('success', i18n.t('event-management.proposal-page.feedbacks.archived'));
    }
    case 'restore-proposal': {
      const proposalStatus = ProposalStatusUpdater.for(authUser.id, params.team, params.event);
      await proposalStatus.restore([params.proposal]);
      return toast('success', i18n.t('event-management.proposal-page.feedbacks.restored'));
    }
  }
  return null;
};

export default function ProposalReviewLayoutRoute({ params, loaderData, actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { event } = useCurrentEventTeam();
  const permissions = useUserTeamPermissions();
  const { proposal, pagination, activityPromise, otherProposalsPromise } = loaderData;

  const hasSpeakers = proposal.speakers.length > 0;
  const hasFormats = event.formats && event.formats.length > 0;
  const hasCategories = event.categories && event.categories.length > 0;

  const speakersWithAccount = proposal.speakers.filter((speaker) => speaker.isConferenceHallUser);
  const speakersConversationEnabled =
    useFlag('speakersCommunication') && event.speakersConversationEnabled && speakersWithAccount.length > 0;

  return (
    <Page>
      <NavigationHeader {...pagination} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <TalkSection
            talk={proposal}
            action={
              <ProposalActionsMenu
                proposal={proposal}
                errors={errors}
                canEditEventProposal={permissions.canEditEventProposal}
                canArchiveProposal={permissions.canChangeProposalStatus}
              />
            }
          >
            <Suspense fallback={null}>
              <Await resolve={otherProposalsPromise}>
                {(proposals) => <OtherProposalsDisclosure proposals={proposals} />}
              </Await>
            </Suspense>
          </TalkSection>

          <Suspense fallback={<ActivityFeed.Loading className="pl-4" />}>
            <Await resolve={activityPromise}>
              {([activity, speakersConversation]) => (
                <ProposalActivityFeed
                  activity={activity}
                  speakersConversation={speakersConversation}
                  speakers={proposal.speakers}
                  canManageConversations={permissions.canManageConversations}
                />
              )}
            </Await>
          </Suspense>
        </div>

        <div className="lg:col-span-4 flex flex-col-reverse lg:flex-col gap-4">
          <ReviewSidebar
            proposal={proposal}
            reviewEnabled={event.reviewEnabled}
            canDeliberate={permissions.canChangeProposalStatus}
          />

          <Card as="section">
            {hasSpeakers ? (
              <>
                <div className="py-4 space-y-4">
                  <SpeakersSection
                    team={params.team}
                    event={params.event}
                    proposalId={params.proposal}
                    proposalSpeakers={proposal.speakers}
                    canChangeSpeakers={permissions.canEditEventProposal}
                    canCreateSpeaker={permissions.canCreateEventSpeaker}
                    canEditSpeaker={permissions.canEditEventSpeaker}
                    className="space-y-3 px-4 lg:px-6"
                  />

                  {speakersConversationEnabled ? (
                    <Suspense fallback={null}>
                      <Await resolve={activityPromise}>
                        {([_, speakersConversation]) => (
                          <ConversationDrawer
                            messages={speakersConversation}
                            recipients={speakersWithAccount}
                            canManageConversations={permissions.canManageConversations}
                            className="flex gap-2 cursor-pointer px-4 lg:px-6 hover:underline"
                          >
                            <ChatBubbleLeftRightIcon className="h-4 w-4" aria-hidden />
                            <Text size="xs" weight="semibold">
                              {speakersConversation.length === 0
                                ? t('event-management.proposal-page.conversation.start')
                                : t('event-management.proposal-page.conversation.started', {
                                    count: speakersConversation.length,
                                  })}
                            </Text>
                          </ConversationDrawer>
                        )}
                      </Await>
                    </Suspense>
                  ) : null}
                </div>

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
                  canChangeFormats={permissions.canEditEventProposal}
                  canCreateFormats={permissions.canEditEvent}
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
                  canChangeCategory={permissions.canEditEventProposal}
                  canCreateCategory={permissions.canEditEvent}
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
              canChangeTags={permissions.canEditEventProposal}
              canCreateTags={permissions.canEditEvent}
              className="space-y-3 p-4 pb-6 lg:px-6"
            />
          </Card>
        </div>
      </div>
    </Page>
  );
}
