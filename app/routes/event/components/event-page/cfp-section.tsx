import {
  CallForPaperDateLabel,
  CallForPaperElapsedTimeLabel,
  CallForPaperStatusLabel,
  cfpColorStatus,
} from '~/routes/components/cfp/cfp.tsx';
import { ClientOnly } from '~/routes/components/utils/client-only.tsx';
import { StatusPill } from '~/shared/design-system/charts/status-pill.tsx';
import { H2, Subtitle } from '~/shared/design-system/typography.tsx';
import type { CfpState } from '~/types/events.types.ts';

type Props = { cfpState: CfpState; cfpStart: Date | null; cfpEnd: Date | null; timezone: string; className?: string };

export function CfpSection({ cfpState, cfpStart, cfpEnd, timezone }: Props) {
  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4 overflow-hidden">
        <StatusPill status={cfpColorStatus(cfpState, cfpStart, cfpEnd)} />
        <ClientOnly>
          {() => (
            <div className="overflow-hidden">
              <H2 truncate>
                {!cfpStart || !cfpEnd ? (
                  <CallForPaperStatusLabel state={cfpState} start={cfpStart} end={cfpEnd} />
                ) : (
                  <CallForPaperElapsedTimeLabel state={cfpState} start={cfpStart} end={cfpEnd} />
                )}
              </H2>
              <Subtitle truncate>
                <CallForPaperDateLabel state={cfpState} start={cfpStart} end={cfpEnd} timezone={timezone} />
              </Subtitle>
            </div>
          )}
        </ClientOnly>
      </div>
    </section>
  );
}
