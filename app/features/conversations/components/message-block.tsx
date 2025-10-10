import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { Badge } from '~/design-system/badges.tsx';
import { Text } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';
import { formatDistance } from '~/shared/datetimes/datetimes.ts';
import type { Message } from '~/shared/types/conversation.types.ts';

type Props = { message: Message; className?: string };

export function MessageBlock({ message, className }: Props) {
  const { i18n } = useTranslation();

  return (
    <div className={cx('w-full rounded-md p-3 space-y-1 ring-1 ring-inset ring-gray-200 bg-white', className)}>
      <div className="flex items-baseline gap-x-1">
        <Text size="xs" weight="semibold">
          {message.sender.name}
        </Text>

        <ClientOnly>
          {() => (
            <time dateTime={message.sentAt.toISOString()} className="text-xs text-gray-500 mr-1">
              a envoyé, {formatDistance(message.sentAt, i18n.language)}
            </time>
          )}
        </ClientOnly>

        {message.sender.role ? <Badge compact>{message.sender.role}</Badge> : null}
      </div>

      <Text className="whitespace-pre-line break-words">{message.content}</Text>
    </div>
  );
}
