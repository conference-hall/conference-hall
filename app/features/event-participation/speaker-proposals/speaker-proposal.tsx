import { parseWithZod } from '@conform-to/zod/v4';
import { Trans, useTranslation } from 'react-i18next';
import { href, redirect } from 'react-router';
import { useUser } from '~/app-platform/components/user-context.tsx';
import { ActivityFeed } from '~/design-system/activity-feed/activity-feed.tsx';
import { Avatar } from '~/design-system/avatar.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';
import { MessageInputForm } from '~/features/conversations/components/message-input-form.tsx';
import { ProposalConversationForSpeakers } from '~/features/conversations/services/proposal-conversation-for-speakers.server.ts';
import { EventPage } from '~/features/event-participation/event-page/services/event-page.server.ts';
import {
  getProposalUpdateSchema,
  ProposalParticipationSchema,
} from '~/features/event-participation/speaker-proposals/services/speaker-proposal.schema.server.ts';
import { SpeakerProposal } from '~/features/event-participation/speaker-proposals/services/speaker-proposal.server.ts';
import { TalkEditButton } from '~/features/speaker/talk-library/components/talk-forms/talk-form-drawer.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { formatDistance } from '~/shared/datetimes/datetimes.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toast, toastHeaders } from '~/shared/toasts/toast.server.ts';
import type { Message } from '~/shared/types/conversation.types.ts';
import { SpeakerProposalStatus } from '~/shared/types/speaker.types.ts';
import { TalkSection } from '../../speaker/talk-library/components/talk-section.tsx';
import { useCurrentEvent } from '../event-page-context.tsx';
import type { Route } from './+types/speaker-proposal.ts';
import { ProposalStatusSection } from './components/proposal-status-section.tsx';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const proposal = await SpeakerProposal.for(userId, params.proposal).get();
  const conversation = await ProposalConversationForSpeakers.for(userId, params.proposal).getConversation();
  return { proposal, conversation };
};

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);

  const i18n = getI18n(context);
  const proposal = SpeakerProposal.for(userId, params.proposal);
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
      const event = await EventPage.of(params.event).get();
      const formatsRequired = event.formats.length > 0 && event.formatsRequired;
      const categoriesRequired = event.categories.length > 0 && event.categoriesRequired;

      const result = parseWithZod(form, { schema: getProposalUpdateSchema(formatsRequired, categoriesRequired) });
      if (result.status !== 'success') return result.error;

      await proposal.update(result.value);
      return toast('success', i18n.t('event.proposal.feedbacks.saved'));
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

  return (
    <Page>
      <h1 className="sr-only">{t('event.proposal.heading')}</h1>
      <div className="space-y-4 lg:space-y-6">
        <ProposalStatusSection proposal={proposal} event={currentEvent} />

        <TalkSection
          talk={proposal}
          canEditSpeakers={canEdit}
          actions={canEdit ? <TalkEditButton initialValues={proposal} event={currentEvent} errors={errors} /> : null}
          showSpeakers
          showFormats
          showCategories
        />
      </div>

      <ProposalConversationFeed messages={conversation} />
    </Page>
  );
}

type ProposalConversationFeedProps = { messages: Array<Message> };

export function ProposalConversationFeed({ messages }: ProposalConversationFeedProps) {
  const { t, i18n } = useTranslation();
  const user = useUser();

  return (
    <ActivityFeed label={t('event-management.proposal-page.activity-feed')} className="px-4">
      <ActivityFeed.Entry className="h-6" withLine aria-hidden />

      {messages.map((message) => (
        <ActivityFeed.Entry
          key={message.id}
          marker={<Avatar picture={message.sender.picture} name={message.sender.name} />}
          withLine
        >
          <div className="w-full rounded-md p-3 ring-1 ring-inset ring-gray-200 bg-white min-w-0 space-y-2">
            <div className="flex justify-between gap-x-4">
              <div className="text-xs text-gray-500">
                <Trans
                  i18nKey="event-management.proposal-page.activity-feed.commented"
                  values={{ name: message.sender.name }}
                  components={[<span key="1" className="font-medium text-gray-900" />]}
                />
              </div>
              <ClientOnly>
                {() => (
                  <time dateTime={message.sentAt.toISOString()} className="flex-none text-xs text-gray-500">
                    {formatDistance(message.sentAt, i18n.language)}
                  </time>
                )}
              </ClientOnly>
            </div>

            <p className="text-sm leading-6 text-gray-700 whitespace-pre-line break-words">{message.content}</p>
          </div>
        </ActivityFeed.Entry>
      ))}

      <ActivityFeed.Entry marker={<Avatar picture={user?.picture} name={user?.name} />}>
        <MessageInputForm
          name="message"
          intent="add-message"
          inputLabel={t('common.conversation.send.label')}
          buttonLabel={t('common.send')}
          placeholder="Send a message to DevFest Nantes organizers"
        />
      </ActivityFeed.Entry>
    </ActivityFeed>
  );
}
