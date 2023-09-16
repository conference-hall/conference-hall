import { cx } from 'class-variance-authority';

import { Text } from '~/design-system/Typography';
import type { CfpState } from '~/routes/__types/event';
import { formatCFPElapsedTime } from '~/utils/event';

import { ClientOnly } from '../utils/ClientOnly';
import { CfpIcon } from './CfpIcon';

type Props = { cfpState: CfpState; cfpStart?: string; cfpEnd?: string; className?: string };

export function CfpElapsedTime({ cfpState, cfpStart, cfpEnd, className }: Props) {
  return (
    <div className={cx('flex items-center space-x-2', className)}>
      <CfpIcon cfpState={cfpState} />
      <ClientOnly>
        {() => (
          <Text variant="secondary" strong truncate>
            {formatCFPElapsedTime(cfpState, cfpStart, cfpEnd)}
          </Text>
        )}
      </ClientOnly>
    </div>
  );
}
