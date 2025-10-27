import { ArrowRightIcon } from '@heroicons/react/16/solid';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { ActivityFeed } from '~/design-system/activity-feed/activity-feed.tsx';
import { AvatarGroup } from '~/design-system/avatar.tsx';
import { Button } from '~/design-system/button.tsx';
import { Text } from '~/design-system/typography.tsx';
import { ConversationDrawer } from '~/features/conversations/components/conversation-drawer.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';

type Props = {
  messages: Array<Message>;
  speakers: Array<{ id: string; name: string; picture: string | null }>;
  canManageConversations: boolean;
};

export function SpeakerConversationEntry({ messages, speakers, canManageConversations }: Props) {
  const { t } = useTranslation();

  return (
    <ActivityFeed.Entry
      withLine
      marker={
        <div className="relative flex h-8 w-8 flex-none items-center bg-indigo-50 border border-blue-100 justify-center rounded-full">
          <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-600" aria-hidden />
        </div>
      }
    >
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between p-3 rounded-md ring-1 ring-inset ring-blue-100 bg-indigo-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1 truncate">
          <AvatarGroup avatars={speakers} size="xs" className="hidden sm:block pr-2" />
          <Text size="s" weight="semibold">
            {t('event-management.proposal-page.activity-feed.conversation.title')}
            <span className="hidden sm:inline"> ⋅ </span>
          </Text>
          <Text size="s" variant="secondary">
            {t('event-management.proposal-page.activity-feed.conversation.message-count', { count: messages.length })}
          </Text>
        </div>

        <div className="flex items-center gap-4">
          <ConversationDrawer messages={messages} recipients={speakers} canManageConversations={canManageConversations}>
            <Button variant="secondary" size="sm" iconRight={ArrowRightIcon}>
              {t('event-management.proposal-page.activity-feed.conversation.button')}
            </Button>
          </ConversationDrawer>
        </div>
      </div>
    </ActivityFeed.Entry>
  );
}
