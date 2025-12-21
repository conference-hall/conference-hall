import { parseWithZod } from '@conform-to/zod/v4';
import { useTranslation } from 'react-i18next';
import { href, redirect } from 'react-router';
import { useUser } from '~/app-platform/components/user-context.tsx';
import { ActivityFeed } from '~/design-system/activity-feed/activity-feed.tsx';
import { Avatar } from '~/design-system/avatar.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { MessageBlock } from '~/features/conversations/components/message-block.tsx';
import { MessageInputForm } from '~/features/conversations/components/message-input-form.tsx';
import { useOptimisticMessages } from '~/features/conversations/components/use-optimistic-messages.ts';
import {
  ConversationMessageDeleteSchema,
  ConversationMessageReactSchema,
  ConversationMessageSaveSchema,
} from '~/features/conversations/services/conversation.schema.server.ts';
import { ProposalConversationForSpeakers } from '~/features/conversations/services/proposal-conversation-for-speakers.server.ts';
import { EventPage } from '~/features/event-participation/event-page/services/event-page.server.ts';
import { SpeakerProposal } from '~/features/event-participation/speaker-proposals/services/speaker-proposal.server.ts';
import { TalkEditButton } from '~/features/speaker/talk-library/components/talk-forms/talk-form-drawer.tsx';
import { getRequiredAuthUser, requiredAuthMiddleware } from '~/shared/auth/auth.middleware.ts';
import { useFlag } from '~/shared/feature-flags/flags-context.tsx';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toast, toastHeaders } from '~/shared/toasts/toast.server.ts';
import type { Message } from '~/shared/types/conversation.types.ts';
import { SpeakerProposalStatus } from '~/shared/types/speaker.types.ts';
import { ProposalParticipationSchema, TalkSaveSchema } from '~/shared/types/speaker-talk.types.ts';
import { TalkSection } from '../../speaker/talk-library/components/talk-section.tsx';
import { useCurrentEvent } from '../event-page-context.tsx';
import type { Route } from './+types/speaker-proposal.ts';
import { ProposalStatusSection } from './components/proposal-status-section.tsx';

export const middleware = [requiredAuthMiddleware];

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const authUser = getRequiredAuthUser(context);
  const proposal = await SpeakerProposal.for(authUser.id, params.proposal).get();
  const conversation = await ProposalConversationForSpeakers.for(authUser.id, params.proposal).getConversation();
  return { proposal, conversation };
};

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const authUser = getRequiredAuthUser(context);

  const i18n = getI18n(context);
  const proposal = SpeakerProposal.for(authUser.id, params.proposal);
  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'proposal-delete': {
      await proposal.delete();
      const headers = await toastHeaders('success', i18n.t('event.proposal.feedbacks.submissions-removed'));
      return redirect(href('/:event/proposals', { event: params.event }), { headers });
    }
    case 'proposal-confirmation': {
      const result = parseWithZod(form, { schema: ProposalParticipationSchema });
      if (result.status !== 'success') return null;
      await proposal.confirm(result.value.participation);
      return toast('success', i18n.t('event.proposal.feedbacks.confirmed'));
    }
    case 'remove-speaker': {
      const speakerId = form.get('_speakerId')?.toString() as string;
      await proposal.removeCoSpeaker(speakerId);
      return toast('success', i18n.t('event.proposal.feedbacks.cospeaker-removed'));
    }
    case 'edit-talk': {
      const tracksSchema = await EventPage.of(params.event).buildTracksSchema();
      const result = parseWithZod(form, { schema: TalkSaveSchema.extend(tracksSchema) });
      if (result.status !== 'success') return result.error;
      await proposal.update(result.value);
      return toast('success', i18n.t('event.proposal.feedbacks.saved'));
    }
    case 'save-message': {
      const conversation = ProposalConversationForSpeakers.for(authUser.id, params.proposal);
      const result = parseWithZod(form, { schema: ConversationMessageSaveSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));
      await conversation.saveMessage(result.value);
      break;
    }
    case 'react-message': {
      const conversation = ProposalConversationForSpeakers.for(authUser.id, params.proposal);
      const result = parseWithZod(form, { schema: ConversationMessageReactSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));
      await conversation.reactMessage(result.value);
      break;
    }
    case 'delete-message': {
      const conversation = ProposalConversationForSpeakers.for(authUser.id, params.proposal);
      const result = parseWithZod(form, { schema: ConversationMessageDeleteSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));
      await conversation.deleteMessage(result.value);
      break;
    }
    default:
      return null;
  }
};

export default function ProposalRoute({ loaderData, actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { proposal, conversation } = loaderData;
  const currentEvent = useCurrentEvent();
  const canEdit = proposal.status === SpeakerProposalStatus.Submitted;
  const speakerConversationEnabled = useFlag('speakersCommunication') && currentEvent.speakersConversationEnabled;

  return (
    <Page>
      <h1 className="sr-only">{t('event.proposal.heading')}</h1>
      <div className="space-y-4 lg:space-y-6">
        <ProposalStatusSection proposal={proposal} event={currentEvent} />

        <TalkSection
          talk={proposal}
          canEditSpeakers={canEdit}
          action={canEdit ? <TalkEditButton initialValues={proposal} event={currentEvent} errors={errors} /> : null}
          showSpeakers
          showFormats
          showCategories
        />
      </div>

      {speakerConversationEnabled ? <ProposalConversationFeed messages={conversation} /> : null}
    </Page>
  );
}

type ProposalConversationFeedProps = { messages: Array<Message> };

export function ProposalConversationFeed({ messages }: ProposalConversationFeedProps) {
  const { t } = useTranslation();
  const user = useUser();

  const intentSuffix = 'message';
  const { optimisticMessages, onOptimisticSaveMessage, onOptimisticDeleteMessage } = useOptimisticMessages(
    messages,
    'SPEAKER',
  );

  return (
    <ActivityFeed label={t('event.proposal.activity-feed')} className="pl-4">
      <ActivityFeed.Entry className="h-6" withLine aria-hidden />

      {optimisticMessages.map((message) => (
        <ActivityFeed.Entry
          key={message.id}
          marker={<Avatar picture={message.sender.picture} name={message.sender.name} />}
          withLine
        >
          <MessageBlock
            intentSuffix={intentSuffix}
            message={message}
            onOptimisticSave={onOptimisticSaveMessage}
            onOptimisticDelete={onOptimisticDeleteMessage}
          />
        </ActivityFeed.Entry>
      ))}

      <ActivityFeed.Entry marker={<Avatar picture={user?.picture} name={user?.name} />}>
        <MessageInputForm
          intent={`save-${intentSuffix}`}
          buttonLabel={t('common.send')}
          inputLabel={t('common.conversation.send.label')}
          placeholder={t('event.proposal.conversation.placeholder', { event: '' })}
          onOptimisticSave={onOptimisticSaveMessage}
        />
      </ActivityFeed.Entry>
    </ActivityFeed>
  );
}
