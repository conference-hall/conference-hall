import { cx } from 'class-variance-authority';

import { StatusPill } from '~/design-system/charts/status-pill.tsx';
import { Text } from '~/design-system/typography.tsx';
import { cfpColorStatus, formatCFPState } from '~/libs/formatters/cfp.ts';
import type { CfpState } from '~/types/events.types.ts';

import { ClientOnly } from '../utils/client-only.tsx';

type Props = { cfpState: CfpState; cfpStart: Date | null; cfpEnd: Date | null; className?: string };

export function CfpElapsedTime({ cfpState, cfpStart, cfpEnd, className }: Props) {
  return (
    <div className={cx('flex items-center space-x-2 truncate', className)}>
      <StatusPill status={cfpColorStatus(cfpState, cfpStart, cfpEnd)} />
      <ClientOnly>
        {() => (
          <Text variant="secondary" weight="medium" truncate>
            {formatCFPState(cfpState, cfpStart, cfpEnd)}
          </Text>
        )}
      </ClientOnly>
    </div>
  );
}
