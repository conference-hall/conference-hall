import { StatusPill } from '~/design-system/charts/status-pill.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { cfpColorStatus, formatCFPDate, formatCFPElapsedTime } from '~/libs/formatters/cfp.ts';
import { ClientOnly } from '~/routes/__components/utils/client-only.tsx';
import type { CfpState } from '~/types/events.types';

type Props = { cfpState: CfpState; cfpStart: Date | null; cfpEnd: Date | null; timezone: string; className?: string };

export function CfpSection({ cfpState, cfpStart, cfpEnd, timezone }: Props) {
  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4 overflow-hidden">
        <StatusPill status={cfpColorStatus(cfpState, cfpStart, cfpEnd)} />
        <ClientOnly>
          {() => (
            <div className="overflow-hidden">
              <H2 truncate>{formatCFPElapsedTime(cfpState, cfpStart, cfpEnd)}</H2>
              <Subtitle truncate>{formatCFPDate(cfpState, timezone, cfpStart, cfpEnd)}</Subtitle>
            </div>
          )}
        </ClientOnly>
      </div>
    </section>
  );
}
