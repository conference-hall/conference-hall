import React from 'react';

import { Divider } from '~/design-system/divider.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';

import type { StatusPillProps } from '../status-pill.tsx';
import { StatusPill } from '../status-pill.tsx';

type Props = { label: string; subtitle?: string; children?: React.ReactNode } & StatusPillProps;

export function StatusCard({ status, label, subtitle, children }: Props) {
  return (
    <Card className="flex flex-col">
      <div className="flex flex-col gap-4 p-6 grow">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <StatusPill status={status} />
            <H2 truncate>{label}</H2>
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
          <div className="flex flex-row items-center gap-4 justify-end p-3">{children}</div>
        </>
      ) : null}
    </Card>
  );
}
