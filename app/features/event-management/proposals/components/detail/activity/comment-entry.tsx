import { ActivityFeed } from '~/design-system/activity-feed/activity-feed.tsx';
import { Avatar } from '~/design-system/avatar.tsx';
import { MessageBlock } from '~/features/conversations/components/message-block.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';

export function CommentEntry({
  message,
  canManageConversations,
}: {
  message: Message;
  canManageConversations: boolean;
}) {
  return (
    <ActivityFeed.Entry marker={<Avatar picture={message.sender.picture} name={message.sender.name} />} withLine>
      <MessageBlock channel="comment" message={message} canManageConversations={canManageConversations} />
    </ActivityFeed.Entry>
  );
}
