import { LoadingIcon } from '~/design-system/icons/loading-icon.tsx';
import { Text } from '~/design-system/typography.tsx';

export function LoadingActivities() {
  return (
    <div className="flex items-center gap-4 ml-4 opacity-75">
      <LoadingIcon className="w-6 h-6" />
      <Text size="xs">Loading activities...</Text>
    </div>
  );
}
