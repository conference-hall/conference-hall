import { useTranslation } from 'react-i18next';
import { AvatarGroup } from '~/design-system/avatar.tsx';
import { buttonStyles } from '~/design-system/button.tsx';
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
    <div
      id="speaker-conversation-entry"
      className="flex flex-col justify-between gap-2 rounded-md bg-blue-50/50 p-3 ring-1 ring-blue-200 ring-inset sm:flex-row sm:items-center"
    >
      <div className="flex flex-col truncate sm:flex-row sm:items-center sm:gap-1">
        <AvatarGroup avatars={speakers} size="xs" className="hidden pr-2 sm:flex" />
        <Text size="s" weight="semibold">
          {t('event-management.proposal-page.activity-feed.conversation.title')}
          <span className="hidden sm:inline"> ⋅ </span>
        </Text>
        <Text size="s" variant="secondary">
          {t('event-management.proposal-page.activity-feed.conversation.message-count', { count: messages.length })}
        </Text>
      </div>

      <div className="flex items-center gap-4">
        <ConversationDrawer
          messages={messages}
          recipients={speakers}
          canManageConversations={canManageConversations}
          className={buttonStyles({ variant: 'secondary', size: 'sm' })}
        >
          {t('event-management.proposal-page.activity-feed.conversation.button')}
        </ConversationDrawer>
      </div>
    </div>
  );
}
