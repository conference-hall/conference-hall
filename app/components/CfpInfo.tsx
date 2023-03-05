import { ClientOnly } from 'remix-utils';

import type { CfpState } from '~/schemas/event';
import cn from 'classnames';
import { formatCFPDate, formatCFPState, formatCFPElapsedTime } from '../utils/event';
import { H2, Text } from '../design-system/Typography';

type CfpLabelProps = { cfpState: CfpState; className?: string };

export function CfpLabel({ cfpState, className }: CfpLabelProps) {
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <CfpIcon cfpState={cfpState} />
      <span className="block text-sm font-semibold">{formatCFPState(cfpState)}</span>
    </div>
  );
}

type CfpInfoProps = {
  cfpState: CfpState;
  cfpStart?: string;
  cfpEnd?: string;
  className?: string;
};

export function CfpInfo({ cfpState, cfpStart, cfpEnd }: CfpInfoProps) {
  return (
    <div>
      <H2 className="inline-flex items-center space-x-3">
        <CfpIcon cfpState={cfpState} />
        <ClientOnly>
          {() => <span className="block">{formatCFPElapsedTime(cfpState, cfpStart, cfpEnd)}</span>}
        </ClientOnly>
      </H2>
      <ClientOnly>
        {() => (
          <Text variant="secondary" className="mt-1">
            {formatCFPDate(cfpState, cfpStart, cfpEnd)}
          </Text>
        )}
      </ClientOnly>
    </div>
  );
}

export function CfpElapsedTime({ cfpState, cfpStart, cfpEnd, className }: CfpInfoProps) {
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <CfpIcon cfpState={cfpState} />
      <ClientOnly>
        {() => <span className="block text-sm font-semibold">{formatCFPElapsedTime(cfpState, cfpStart, cfpEnd)}</span>}
      </ClientOnly>
    </div>
  );
}

function CfpIcon({ cfpState }: CfpLabelProps) {
  if (cfpState === 'CLOSED') {
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-100" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-orange-400"></span>
      </span>
    );
  }
  if (cfpState === 'FINISHED') {
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-100" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-red-400"></span>
      </span>
    );
  }
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100" aria-hidden="true">
      <span className="h-2 w-2 rounded-full bg-green-400"></span>
    </span>
  );
}
