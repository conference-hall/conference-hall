import { cx } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import type { AvailableChartColorsKeys } from '~/shared/design-system/charts/chart-utils.ts';
import { DonutChart } from '~/shared/design-system/charts/donut.tsx';
import { NoData } from '~/shared/design-system/dashboard/no-data.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/shared/design-system/typography.tsx';

type Data = {
  name: string;
  amount: number;
  colorChart: AvailableChartColorsKeys;
  colorLegend: string;
  to?: string;
};

type Props = {
  title: string;
  subtitle: string;
  data: Array<Data>;
  donutLabel: string;
  categoryLabel?: string;
  amountLabel?: string;
  noDataHint?: string;
  children?: ReactNode;
};

export default function DonutCard({
  title,
  subtitle,
  donutLabel,
  categoryLabel = 'Category',
  amountLabel = 'Amount',
  noDataHint,
  data,
  children,
}: Props) {
  const hasData = data.filter((d) => d.amount !== 0).length > 0;
  const colors = data.map((d) => d.colorChart);

  return (
    <Card className="w-full">
      <Card.Title>
        <H2>{title}</H2>
        <Subtitle>{subtitle}</Subtitle>
      </Card.Title>

      <Card.Content>
        {hasData ? (
          <>
            <DonutChart
              className="mt-4 w-full"
              data={data}
              category="name"
              value="amount"
              label={donutLabel}
              showLabel={true}
              colors={colors}
            />
            <div>
              <p className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>{categoryLabel}</span>
                <span>{amountLabel}</span>
              </p>
              <ul className="mt-2 divide-y divide-gray-200 text-sm text-gray-500">
                {data.map((item) => (
                  <li key={item.name} className="relative flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2.5 truncate">
                      <span className={cx(item.colorLegend, 'size-2.5 shrink-0 rounded-xs')} aria-hidden={true} />
                      {item.to ? (
                        <Link to={item.to} className="underline-offset-2 hover:underline truncate">
                          {item.name}
                        </Link>
                      ) : (
                        <span className="truncate">{item.name}</span>
                      )}
                    </div>
                    <p className="flex items-center space-x-2">
                      <span className="font-medium tabular-nums text-gray-900">{item.amount}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <NoData subtitle={noDataHint} className={!children ? 'h-full' : undefined} />
        )}
        {children}
      </Card.Content>
    </Card>
  );
}
