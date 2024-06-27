import { ButtonLink } from '~/design-system/buttons.tsx';
import { StatusPill } from '~/design-system/charts/status-pill.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { cfpColorStatus, formatCFPDate, formatCFPElapsedTime } from '~/libs/formatters/cfp.ts';
import { ClientOnly } from '~/routes/__components/utils/client-only.tsx';
import type { CfpState } from '~/types/events.types';

type Props = { cfpState: CfpState; cfpStart?: string; cfpEnd?: string; className?: string };

export function CfpSection({ cfpState, cfpStart, cfpEnd }: Props) {
  return (
    <section className="flex h-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <div className="truncate">
          <ClientOnly>
            {() => (
              <div className="flex items-center gap-4">
                <StatusPill status={cfpColorStatus(cfpState, cfpStart, cfpEnd)} />
                <div>
                  <H2 truncate>{formatCFPElapsedTime(cfpState, cfpStart, cfpEnd)}</H2>
                  <Subtitle truncate>{formatCFPDate(cfpState, cfpStart, cfpEnd)}</Subtitle>
                </div>
              </div>
            )}
          </ClientOnly>
        </div>
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
