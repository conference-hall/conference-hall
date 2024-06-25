import { cx } from 'class-variance-authority';

import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H3, Subtitle } from '~/design-system/typography.tsx';

import type { BarListProps } from '../bar-list.tsx';
import { BarList } from '../bar-list.tsx';
import { ChartEmptyState } from '../chart-empty-state.tsx';

interface BarListCardProps<T = unknown> {
  label: string;
  metric: string;
  data?: BarListProps<T>['data'];
}

const MAX_BAR = 7;

export function BarListCard({ label, metric, data = [] }: BarListCardProps) {
  return (
    <Card className="space-y-6 p-6 relative">
      <div className="flex items-center justify-between">
        <H3>{label}</H3>
        <Subtitle size="xs">{metric}</Subtitle>
      </div>
      <div className={cx('overflow-hidden max-h-[260px]', { 'pb-6': data.length > MAX_BAR })}>
        {data.length !== 0 ? <BarList data={data} /> : <ChartEmptyState />}
      </div>
      {data.length > MAX_BAR && (
        <div className="flex justify-center absolute inset-x-0 rounded-b-md bottom-0 bg-gradient-to-t from-white to-transparent py-7 pt-12">
          <Button variant="secondary" onClick={() => {}}>
            Show more
          </Button>
        </div>
      )}
    </Card>
  );
}
