import cn from 'classnames';
import { CfpIcon } from '~/shared-components/cfp/CfpIcon';
import type { CfpState } from '~/schemas/event';
import { formatCFPState } from '~/utils/event';

type Props = { cfpState: CfpState; className?: string };

export function CfpLabel({ cfpState, className }: Props) {
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <CfpIcon cfpState={cfpState} />
      <span className="block text-sm font-semibold">{formatCFPState(cfpState)}</span>
    </div>
  );
}
