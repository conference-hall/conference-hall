import { ButtonLink } from '~/design-system/Buttons.tsx';
import { Container } from '~/design-system/layouts/Container.tsx';
import { H2, Subtitle } from '~/design-system/Typography.tsx';
import { CfpIcon } from '~/routes/__components/cfp/CfpIcon.tsx';
import { ClientOnly } from '~/routes/__components/utils/ClientOnly.tsx';
import type { CfpState } from '~/routes/__types/event.ts';
import { formatCFPDate, formatCFPElapsedTime } from '~/utils/event.ts';

type Props = { cfpState: CfpState; cfpStart?: string; cfpEnd?: string; className?: string };

export function CfpSection({ cfpState, cfpStart, cfpEnd }: Props) {
  return (
    <section className="mb-8 bg-white shadow">
      <Container className="flex h-full flex-col gap-4 px-4 py-6 sm:h-24 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="truncate">
            <ClientOnly>
              {() => (
                <div className="flex items-center gap-4">
                  <CfpIcon cfpState={cfpState} />
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
      </Container>
    </section>
  );
}
