import type React from 'react';
import { useId } from 'react';
import { Divider } from '~/design-system/divider.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import type { StatusPillProps } from '../charts/status-pill.tsx';
import { StatusPill } from '../charts/status-pill.tsx';

type Props = { label: React.ReactNode; subtitle?: React.ReactNode; children?: React.ReactNode } & StatusPillProps;

export function StatusCard({ status, label, subtitle, children }: Props) {
  const id = useId();

  return (
    <Card className="flex flex-col" aria-labelledby={id}>
      <div className="flex grow flex-col gap-4 p-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <StatusPill status={status} />
            <H2 id={id} truncate>
              {label}
            </H2>
          </div>
          {subtitle ? (
            <div className="mt-1 ml-6">
              <Subtitle>{subtitle}</Subtitle>
            </div>
          ) : null}
        </div>
      </div>

      {children ? (
        <>
          <Divider />
          <div className="flex flex-row items-center justify-end gap-4 p-3">{children}</div>
        </>
      ) : null}
    </Card>
  );
}

type FallbackProps = { showActions?: boolean };

function Fallback({ showActions = false }: FallbackProps) {
  return (
    <Card className="flex animate-pulse flex-col" aria-hidden="true">
      <div className="flex grow flex-col gap-4 p-6">
        <div className="mt-1 flex flex-col">
          <div className="flex items-center gap-4">
            <span className="flex h-4 w-4 shrink-0 rounded-full bg-slate-100" />
            <div className="h-4 w-40 rounded-sm bg-slate-100" />
          </div>
          <div className="mt-3 ml-8">
            <div className="h-3 rounded-sm bg-slate-100" />
          </div>
        </div>
      </div>
      {showActions ? (
        <>
          <Divider />
          <div className="flex flex-row items-center justify-end gap-4 p-3">
            <div className="h-5 w-16 rounded-sm bg-slate-100" />
          </div>
        </>
      ) : null}
    </Card>
  );
}

StatusCard.Fallback = Fallback;
