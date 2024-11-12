import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import { Text } from '~/design-system/typography.tsx';

type Props = { count: number };

export function ReviewComments({ count }: Props) {
  if (count === 0) return null;

  return (
    <div className="flex items-center flex-row-reverse justify-end gap-1">
      <ChatBubbleBottomCenterTextIcon className="h-5 w-5 shrink-0" aria-label="Number of comments" />
      <Text weight="semibold" variant="secondary">
        {count}
      </Text>
    </div>
  );
}
