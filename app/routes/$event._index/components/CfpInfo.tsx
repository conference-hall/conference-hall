import { ClientOnly } from 'remix-utils';
import { H2, Text } from '~/design-system/Typography';

import type { CfpState } from '~/schemas/event';
import { CfpIcon } from '../../../shared-components/cfp/CfpIcon';
import { formatCFPDate, formatCFPElapsedTime } from '~/utils/event';

type CfpInfoProps = { cfpState: CfpState; cfpStart?: string; cfpEnd?: string; className?: string };

export function CfpInfo({ cfpState, cfpStart, cfpEnd }: CfpInfoProps) {
  return (
    <div>
      <H2>
        <CfpIcon cfpState={cfpState} />
        <ClientOnly>
          {() => <span className="block">{formatCFPElapsedTime(cfpState, cfpStart, cfpEnd)}</span>}
        </ClientOnly>
      </H2>
      <ClientOnly>{() => <Text type="secondary">{formatCFPDate(cfpState, cfpStart, cfpEnd)}</Text>}</ClientOnly>
    </div>
  );
}
