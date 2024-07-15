import slugify from '@sindresorhus/slugify';
import type { ReactNode } from 'react';

import { Divider } from '~/design-system/divider.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Text } from '~/design-system/typography.tsx';

type Props = { label: string; stat: string; children?: ReactNode };

export function StatisticCard({ label, stat, children }: Props) {
  const id = slugify(label);

  return (
    <Card className="flex flex-col" aria-labelledby={id}>
      <div className="flex flex-col grow px-6 py-4">
        <Text id={id} variant="secondary">
          {label}
        </Text>
        <p className="text-3xl font-semibold mt-2">{stat}</p>
      </div>

      {children && (
        <>
          <Divider />
          <div className="flex flex-row items-center justify-end py-3 px-4">{children}</div>
        </>
      )}
    </Card>
  );
}
