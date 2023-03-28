import { ClientOnly } from 'remix-utils';
import { H2 } from '~/design-system/Typography';

import type { CfpState } from '~/schemas/event';
import { CfpIcon } from '../../../shared-components/cfp/CfpIcon';
import { formatCFPElapsedTime } from '~/utils/event';
import { ButtonLink } from '~/design-system/Buttons';

type Props = { cfpState: CfpState; cfpStart?: string; cfpEnd?: string; className?: string };

export function CfpSection({ cfpState, cfpStart, cfpEnd }: Props) {
  return (
    <section className="my-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <CfpIcon cfpState={cfpState} />
        <ClientOnly>{() => <H2 mb={0}>{formatCFPElapsedTime(cfpState, cfpStart, cfpEnd)}</H2>}</ClientOnly>
      </div>
      {cfpState === 'OPENED' && (
        <div className="flex-shrink-0">
          <ButtonLink to="submission" block>
            Submit a proposal
          </ButtonLink>
        </div>
      )}
    </section>
  );
}
