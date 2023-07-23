import { cx } from 'class-variance-authority';

import { CfpIcon } from '~/routes/__components/cfp/CfpIcon';
import type { CfpState } from '~/routes/__types/event';
import { formatCFPState } from '~/utils/event';

type Props = { cfpState: CfpState; className?: string };

export function CfpLabel({ cfpState, className }: Props) {
  return (
    <div className={cx('flex items-center space-x-3', className)}>
      <CfpIcon cfpState={cfpState} />
      <span className="block text-sm font-semibold">{formatCFPState(cfpState)}</span>
    </div>
  );
}
