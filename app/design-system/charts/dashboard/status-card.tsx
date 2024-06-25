import React from 'react';

import { Divider } from '~/design-system/divider.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';

type Props = { label: string; subtitle: string; children: React.ReactNode } & StatusPillProps;

export function StatusCard({ status, label, subtitle, children }: Props) {
  return (
    <Card className="flex flex-col">
      <div className="flex flex-col gap-4 p-6 grow">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <StatusPill status={status} />
            <H2 truncate>{label}</H2>
          </div>
          <div className="mt-1 ml-6">
            <Subtitle>{subtitle}</Subtitle>
          </div>
        </div>
      </div>

      <Divider />

      <div className="flex flex-row items-center gap-4 justify-end p-3">{children}</div>
    </Card>
  );
}

type StatusPillProps = { status: 'success' | 'error' | 'warning' | 'disabled' };

export function StatusPill({ status }: StatusPillProps) {
  switch (status) {
    case 'success':
      return <span className="flex h-3 w-3 flex-shrink-0 rounded-full bg-green-400" aria-hidden="true"></span>;
    case 'error':
      return <span className="flex h-3 w-3 flex-shrink-0 rounded-full bg-red-400" aria-hidden="true"></span>;
    case 'warning':
      return <span className="flex h-3 w-3 flex-shrink-0 rounded-full bg-orange-400" aria-hidden="true"></span>;
    case 'disabled':
      return <span className="flex h-3 w-3 flex-shrink-0 rounded-full bg-gray-400" aria-hidden="true"></span>;
  }
}
