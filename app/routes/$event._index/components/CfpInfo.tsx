import { ClientOnly } from 'remix-utils';
import { H3, Text } from '~/design-system/Typography';

import type { CfpState } from '~/schemas/event';
import { CfpIcon } from '../../../shared-components/cfp/CfpIcon';
import { formatCFPDate, formatCFPElapsedTime } from '~/utils/event';

type CfpInfoProps = { cfpState: CfpState; cfpStart?: string; cfpEnd?: string; className?: string };

export function CfpInfo({ cfpState, cfpStart, cfpEnd }: CfpInfoProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <CfpIcon cfpState={cfpState} />
        <ClientOnly>
          {() => (
            <H3 as="p" mb={0}>
              {formatCFPElapsedTime(cfpState, cfpStart, cfpEnd)}
            </H3>
          )}
        </ClientOnly>
      </div>
      <ClientOnly>
        {() => (
          <Text type="secondary" size="s">
            {formatCFPDate(cfpState, cfpStart, cfpEnd)}
          </Text>
        )}
      </ClientOnly>
    </div>
  );
}
