import { ClientOnly } from 'remix-utils';
import cn from 'classnames';
import type { CfpState } from '~/schemas/event';
import { CfpIcon } from './CfpIcon';
import { formatCFPElapsedTime } from '~/utils/event';

type Props = { cfpState: CfpState; cfpStart?: string; cfpEnd?: string; className?: string };

export function CfpElapsedTime({ cfpState, cfpStart, cfpEnd, className }: Props) {
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <CfpIcon cfpState={cfpState} />
      <ClientOnly>
        {() => <span className="block text-sm font-semibold">{formatCFPElapsedTime(cfpState, cfpStart, cfpEnd)}</span>}
      </ClientOnly>
    </div>
  );
}
