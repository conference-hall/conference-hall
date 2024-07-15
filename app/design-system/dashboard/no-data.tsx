import { ChartBarIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';

import { Subtitle, Text } from '../typography.tsx';

type Props = { subtitle?: string; className?: string };

export function NoData({ subtitle, className }: Props) {
  return (
    <div
      className={cx(
        'flex min-h-60 items-center justify-center rounded-md border border-dashed border-gray-200 p-4',
        className,
      )}
    >
      <div className="text-center">
        <ChartBarIcon className="mx-auto h-7 w-7 text-gray-400" aria-hidden={true} />
        <div className="mt-2 space-y-2">
          <Text weight="medium">No data to show</Text>
          {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
        </div>
      </div>
    </div>
  );
}
