import cn from 'classnames';
import { CfpState, formatCFPDate, formatCFPState } from '../../utils/event';
import { Heading } from '../Heading';

type CfpLabelProps = { cfpState: CfpState; className?: string };

export function CfpLabel({ cfpState, className }: CfpLabelProps) {
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <CfpIcon cfpState={cfpState} />
      <span className="block text-sm font-semibold">{formatCFPState(cfpState)}</span>
    </div>
  );
}

type CfpHeaderProps = { cfpState: CfpState; cfpStart?: string; cfpEnd?: string };

export function CfpHeader({ cfpState, cfpStart, cfpEnd }: CfpHeaderProps) {
  return (
    <Heading description={formatCFPDate(cfpState, cfpStart, cfpEnd)}>
      <span className="flex items-center space-x-3">
        <CfpIcon cfpState={cfpState} />
        <span className="block">{formatCFPState(cfpState)}</span>
      </span>
    </Heading>
  );
}

function CfpIcon({ cfpState }: CfpLabelProps) {
  if (cfpState === 'CLOSED') {
    return (
      <span className="h-4 w-4 bg-orange-100 rounded-full flex items-center justify-center" aria-hidden="true">
        <span className="h-2 w-2 bg-orange-400 rounded-full"></span>
      </span>
    );
  }
  if (cfpState === 'FINISHED') {
    return (
      <span className="h-4 w-4 bg-red-100 rounded-full flex items-center justify-center" aria-hidden="true">
        <span className="h-2 w-2 bg-red-400 rounded-full"></span>
      </span>
    );
  }
  return (
    <span className="h-4 w-4 bg-green-100 rounded-full flex items-center justify-center" aria-hidden="true">
      <span className="h-2 w-2 bg-green-400 rounded-full"></span>
    </span>
  );
}
