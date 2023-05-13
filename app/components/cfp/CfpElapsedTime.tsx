import { ClientOnly } from 'remix-utils';
import cn from 'classnames';
import type { CfpState } from '~/schemas/event';
import { CfpIcon } from './CfpIcon';
import { formatCFPElapsedTime } from '~/utils/event';
import { Text } from '~/design-system/Typography';

type Props = { cfpState: CfpState; cfpStart?: string; cfpEnd?: string; className?: string };

export function CfpElapsedTime({ cfpState, cfpStart, cfpEnd, className }: Props) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <CfpIcon cfpState={cfpState} />
      <ClientOnly>
        {() => (
          <Text variant="secondary" size="s" strong truncate>
            {formatCFPElapsedTime(cfpState, cfpStart, cfpEnd)}
          </Text>
        )}
      </ClientOnly>
    </div>
  );
}
