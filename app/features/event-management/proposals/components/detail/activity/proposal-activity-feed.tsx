import { useTranslation } from 'react-i18next';
import type { Feed } from '~/features/event-management/proposals/services/activity-feed.server.ts';
import type { Message } from '~/shared/types/conversation.types.ts';
import { useUser } from '~/app-platform/components/user-context.tsx';
import { ActivityFeed } from '~/design-system/activity-feed/activity-feed.tsx';
import { Avatar } from '~/design-system/avatar.tsx';
import { MessageInputForm } from '~/features/conversations/components/message-input-form.tsx';
import { CommentEntry } from './comment-entry.tsx';
import { ReviewEntry } from './review-entry.tsx';
import { SpeakerConversationEntry } from './speaker-conversation-entry.tsx';

type Props = {
  activity: Feed;
  speakersConversation: Array<Message>;
  speakers: Array<{ id: string; name: string; picture: string | null }>;
  canManageConversations: boolean;
};

export function ProposalActivityFeed({ activity, speakersConversation, speakers, canManageConversations }: Props) {
  const user = useUser();
  const { t } = useTranslation();

  return (
    <ActivityFeed label={t('event-management.proposal-page.activity-feed')} className="pl-4">
      <ActivityFeed.Entry className="h-6" withLine aria-hidden />

      {speakersConversation.length > 0 ? (
        <SpeakerConversationEntry
          messages={speakersConversation}
          speakers={speakers}
          canManageConversations={canManageConversations}
        />
      ) : null}

      {activity.map((item) => {
        if (item.type === 'comment') {
          return <CommentEntry key={item.id} item={item} canManageConversations={canManageConversations} />;
        } else if (item.type === 'review') {
          return <ReviewEntry key={item.id} item={item} />;
        } else {
          return null;
        }
      })}

      <ActivityFeed.Entry marker={<Avatar picture={user?.picture} name={user?.name} />}>
        <MessageInputForm
          intent="save-comment"
          inputLabel={t('event-management.proposal-page.comment.label')}
          buttonLabel={t('event-management.proposal-page.comment.submit')}
          placeholder={t('event-management.proposal-page.comment.placeholder')}
        />
      </ActivityFeed.Entry>
    </ActivityFeed>
  );
}
