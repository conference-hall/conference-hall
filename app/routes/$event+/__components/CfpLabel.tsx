import { cx } from 'class-variance-authority';

import type { CfpState } from '~/domains/shared/CallForPaper';
import { formatCFPState } from '~/libs/formatters/cfp';
import { CfpIcon } from '~/routes/__components/cfp/CfpIcon.tsx';

type Props = { cfpState: CfpState; className?: string };

export function CfpLabel({ cfpState, className }: Props) {
  return (
    <div className={cx('flex items-center space-x-3', className)}>
      <CfpIcon cfpState={cfpState} />
      <span className="block text-sm font-semibold">{formatCFPState(cfpState)}</span>
    </div>
  );
}
