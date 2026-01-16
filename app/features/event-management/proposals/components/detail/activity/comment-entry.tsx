import type { FeedItem } from '~/features/event-management/proposals/services/activity-feed.server.ts';
import { ActivityFeed } from '~/design-system/activity-feed/activity-feed.tsx';
import { Avatar } from '~/design-system/avatar.tsx';
import { MessageBlock } from '~/features/conversations/components/message-block.tsx';

// todo(comments): FeedItem type should be shared (not on server)
export function CommentEntry({ item, canManageConversations }: { item: FeedItem; canManageConversations: boolean }) {
  if (item.type !== 'comment') return null;

  return (
    <ActivityFeed.Entry marker={<Avatar picture={item.picture} name={item.user} />} withLine>
      <MessageBlock
        intentSuffix="comment"
        message={{
          id: item.id,
          content: item.comment,
          sender: { userId: item.userId, name: item.user, picture: item.picture },
          reactions: item.reactions,
          sentAt: item.timestamp,
        }}
        canManageConversations={canManageConversations}
      />
    </ActivityFeed.Entry>
  );
}
