import { cx } from 'class-variance-authority';

import { Text } from '~/design-system/typography.cap.tsx';
import { formatCFPElapsedTime } from '~/libs/formatters/cfp.ts';
import type { CfpState } from '~/types/events.types.ts';

import { ClientOnly } from '../utils/client-only.tsx';
import { CfpIcon } from './CfpIcon.tsx';

type Props = { cfpState: CfpState; cfpStart?: string; cfpEnd?: string; className?: string };

export function CfpElapsedTime({ cfpState, cfpStart, cfpEnd, className }: Props) {
  return (
    <div className={cx('flex items-center space-x-2', className)}>
      <CfpIcon cfpState={cfpState} />
      <ClientOnly>
        {() => (
          <Text variant="secondary" weight="medium" truncate>
            {formatCFPElapsedTime(cfpState, cfpStart, cfpEnd)}
          </Text>
        )}
      </ClientOnly>
    </div>
  );
}
