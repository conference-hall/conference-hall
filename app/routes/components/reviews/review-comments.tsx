import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Text } from '~/shared/design-system/typography.tsx';

type Props = { count: number };

export function ReviewComments({ count }: Props) {
  const { t } = useTranslation();
  if (count === 0) return null;

  return (
    <div className="flex items-center justify-end gap-1">
      <Text weight="semibold" variant="secondary">
        {count}
      </Text>
      <ChatBubbleBottomCenterTextIcon
        className="size-5 shrink-0 text-gray-600"
        aria-label={t('event-management.proposals.list.comments', { count })}
      />
    </div>
  );
}
