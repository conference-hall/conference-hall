import { useTranslation } from 'react-i18next';
import { Avatar } from '~/design-system/avatar.tsx';
import { Badge } from '~/design-system/badges.tsx';
import { Text } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';
import { formatDistance } from '~/shared/datetimes/datetimes.ts';
import type { Message } from '~/shared/types/conversation.types.ts';

type Props = { message: Message };

export function MessageBlock({ message }: Props) {
  const { i18n } = useTranslation();

  return (
    <div className="flex gap-4 p-3 w-full rounded-lg hover:bg-gray-50">
      <Avatar picture={message.sender.picture} name={message.sender.name} size="s" square className="mt-1" />

      <div className="w-full">
        <div className="flex items-baseline gap-x-2">
          <Text weight="semibold">{message.sender.name}</Text>

          <ClientOnly>
            {() => (
              <time dateTime={message.sentAt.toISOString()} className="text-xs text-gray-500">
                {formatDistance(message.sentAt, i18n.language)}
              </time>
            )}
          </ClientOnly>

          <Badge compact color={message.sender.role === 'SPEAKER' ? 'indigo' : 'gray'}>
            {message.sender.role}
          </Badge>
        </div>

        <Text className="whitespace-pre-line break-words">{message.content}</Text>
      </div>
    </div>
  );
}
