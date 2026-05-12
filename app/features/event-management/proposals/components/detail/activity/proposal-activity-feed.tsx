import { useTranslation } from 'react-i18next';
import { useUser } from '~/app-platform/components/user-context.tsx';
import { ActivityFeed } from '~/design-system/activity-feed/activity-feed.tsx';
import { Avatar } from '~/design-system/avatar.tsx';
import { MessageBlock } from '~/features/conversations/components/message-block.tsx';
import { MessageInputForm } from '~/features/conversations/components/message-input-form.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';
import type { ReviewMember } from './reviews-group-entry.tsx';
import { ReviewsGroupEntry } from './reviews-group-entry.tsx';
import { SpeakerConversationEntry } from './speaker-conversation-entry.tsx';

type ReviewSummary = {
  average: number | null;
  positives: number;
  negatives: number;
};

type Props = {
  comments: Array<Message>;
  reviews: Array<ReviewMember> | null;
  reviewsSummary: ReviewSummary | null;
  speakerConversation: Array<Message>;
  speakers: Array<{ id: string; name: string; picture: string | null }>;
  canManageConversations: boolean;
  canDismissReviews: boolean;
};

export function ProposalActivityFeed({
  comments,
  reviews,
  reviewsSummary,
  speakerConversation,
  speakers,
  canManageConversations,
  canDismissReviews,
}: Props) {
  const user = useUser();
  const { t } = useTranslation();

  return (
    <ActivityFeed label={t('event-management.proposal-page.activity-feed')} className="pl-4">
      <ActivityFeed.Entry className="h-6" withLine aria-hidden />

      {speakerConversation.length > 0 ? (
        <SpeakerConversationEntry
          messages={speakerConversation}
          speakers={speakers}
          canManageConversations={canManageConversations}
        />
      ) : null}

      {reviews && reviews.length > 0 ? (
        <ReviewsGroupEntry reviews={reviews} summary={reviewsSummary ?? null} canDismissReviews={canDismissReviews} />
      ) : null}

      {comments.map((message) => (
        <ActivityFeed.Entry
          key={message.id}
          marker={<Avatar picture={message.sender.picture} name={message.sender.name} />}
          withLine
        >
          <MessageBlock
            channel="comment"
            message={message}
            canManageConversations={canManageConversations}
            showRoleBadge={false}
          />
        </ActivityFeed.Entry>
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
