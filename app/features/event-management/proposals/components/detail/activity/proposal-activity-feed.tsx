import { useTranslation } from 'react-i18next';
import { useUser } from '~/app-platform/components/user-context.tsx';
import { ActivityFeed } from '~/design-system/activity-feed/activity-feed.tsx';
import { Avatar } from '~/design-system/avatar.tsx';
import { MessageInputForm } from '~/features/conversations/components/message-input-form.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';
import { CommentEntry } from './comment-entry.tsx';
import type { ReviewMember } from './reviews-group-entry.tsx';
import { ReviewsGroupEntry } from './reviews-group-entry.tsx';
import { SpeakerConversationEntry } from './speaker-conversation-entry.tsx';

type Props = {
  comments: Array<Message>;
  reviews: Array<ReviewMember> | null;
  speakersConversation: Array<Message>;
  speakers: Array<{ id: string; name: string; picture: string | null }>;
  canManageConversations: boolean;
};

export function ProposalActivityFeed({
  comments,
  reviews,
  speakersConversation,
  speakers,
  canManageConversations,
}: Props) {
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

      {reviews && reviews.length > 0 ? <ReviewsGroupEntry reviews={reviews} /> : null}

      {comments.map((message) => (
        <CommentEntry key={message.id} message={message} canManageConversations={canManageConversations} />
      ))}

      <ActivityFeed.Entry marker={<Avatar picture={user?.picture} name={user?.name} />}>
        <MessageInputForm
          channel="comment"
          inputLabel={t('event-management.proposal-page.comment.label')}
          buttonLabel={t('event-management.proposal-page.comment.submit')}
          placeholder={t('event-management.proposal-page.comment.placeholder')}
        />
      </ActivityFeed.Entry>
    </ActivityFeed>
  );
}
