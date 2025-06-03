import { LoadingIcon } from '~/design-system/icons/loading-icon.tsx';

export function LoadingActivities() {
  return (
    <div className="flex items-center gap-4 ml-4 opacity-75">
      <LoadingIcon className="w-6 h-6" />
    </div>
  );
}
