import cn from 'classnames';
import { CfpState, formatCFPDate, formatCFPState } from '../utils/event';
import { H2, Text } from '../components-ui/Typography';

type CfpLabelProps = { cfpState: CfpState; className?: string };

export function CfpLabel({ cfpState, className }: CfpLabelProps) {
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <CfpIcon cfpState={cfpState} />
      <span className="block text-sm font-semibold">
        {formatCFPState(cfpState)}
      </span>
    </div>
  );
}

type CfpHeaderProps = {
  cfpState: CfpState;
  cfpStart?: string;
  cfpEnd?: string;
};

export function CfpHeader({ cfpState, cfpStart, cfpEnd }: CfpHeaderProps) {
  return (
    <div>
      <H2 className="flex items-center space-x-3">
        <CfpIcon cfpState={cfpState} />
        <span className="block">{formatCFPState(cfpState)}</span>
      </H2>
      <Text variant="secondary" className="mt-1">
        {formatCFPDate(cfpState, cfpStart, cfpEnd)}
      </Text>
    </div>
  );
}

function CfpIcon({ cfpState }: CfpLabelProps) {
  if (cfpState === 'CLOSED') {
    return (
      <span
        className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-100"
        aria-hidden="true"
      >
        <span className="h-2 w-2 rounded-full bg-orange-400"></span>
      </span>
    );
  }
  if (cfpState === 'FINISHED') {
    return (
      <span
        className="flex h-4 w-4 items-center justify-center rounded-full bg-red-100"
        aria-hidden="true"
      >
        <span className="h-2 w-2 rounded-full bg-red-400"></span>
      </span>
    );
  }
  return (
    <span
      className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100"
      aria-hidden="true"
    >
      <span className="h-2 w-2 rounded-full bg-green-400"></span>
    </span>
  );
}
