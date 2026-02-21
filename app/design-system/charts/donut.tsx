import { cx } from 'class-variance-authority';
import type React from 'react';
import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { AvailableChartColorsKeys } from './chart-utils.ts';
import { AvailableChartColors, constructCategoryColors, getColorClassName } from './chart-utils.ts';

const parseData = (
  data: Record<string, any>[],
  categoryColors: Map<string, AvailableChartColorsKeys>,
  category: string,
) =>
  data.map((dataPoint) => ({
    ...dataPoint,
    color: categoryColors.get(dataPoint[category]) || AvailableChartColors[0],
    className: getColorClassName(categoryColors.get(dataPoint[category]) || AvailableChartColors[0], 'fill'),
  }));

type PayloadItem = {
  category: string;
  value: number;
  color: AvailableChartColorsKeys;
};

interface ChartTooltipProps {
  active: boolean | undefined;
  payload: PayloadItem[];
  valueFormatter: (value: number) => string;
}

const ChartTooltip = ({ active, payload, valueFormatter }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={cx(
          // base
          'rounded-md border text-sm shadow-md',
          // border color
          'border-gray-200',
          // background color
          'bg-white',
        )}
      >
        <div className={cx('space-y-1 px-4 py-2')}>
          {payload.map(({ value, category, color }, index) => (
            <div key={`id-${index}`} className="flex items-center justify-between space-x-8">
              <div className="flex items-center space-x-2">
                <span
                  aria-hidden="true"
                  className={cx('size-2 shrink-0 rounded-full', getColorClassName(color, 'bg'))}
                />
                <p
                  className={cx(
                    // base
                    'text-right whitespace-nowrap',
                    // text color
                    'text-gray-700',
                  )}
                >
                  {category}
                </p>
              </div>
              <p
                className={cx(
                  // base
                  'text-right font-medium whitespace-nowrap tabular-nums',
                  // text color
                  'text-gray-900',
                )}
              >
                {valueFormatter(value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

type DonutChartVariant = 'donut' | 'pie';

interface DonutChartProps extends React.ComponentProps<'div'> {
  data: Record<string, any>[];
  category: string;
  value: string;
  colors?: AvailableChartColorsKeys[];
  variant?: DonutChartVariant;
  label?: string;
  showLabel?: boolean;
  showTooltip?: boolean;
}

export const DonutChart = ({
  data = [],
  value,
  category,
  colors = AvailableChartColors,
  variant = 'donut',
  label,
  showLabel = false,
  showTooltip = true,
  className,
  ref,
  ...other
}: DonutChartProps) => {
  const isDonut = variant === 'donut';
  const categories = Array.from(new Set(data.map((item) => item[category])));
  const categoryColors = constructCategoryColors(categories, colors);

  return (
    <div ref={ref} className={cx('h-40 w-40', className)} {...other}>
      <ResponsiveContainer height="100%" width="100%" initialDimension={{ height: 160, width: 160 }}>
        <PieChart margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
          {showLabel && isDonut && (
            <text
              className="fill-gray-700 text-2xl font-semibold"
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {label}
            </text>
          )}
          <Pie
            className="stroke-white [&_.recharts-pie-sector]:outline-hidden"
            data={parseData(data, categoryColors, category)}
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={-270}
            innerRadius={isDonut ? '75%' : '0%'}
            outerRadius="100%"
            stroke=""
            strokeLinejoin="round"
            dataKey={value}
            nameKey={category}
            isAnimationActive={false}
            style={{ outline: 'none' }}
          />
          {showTooltip && (
            <Tooltip
              wrapperStyle={{ outline: 'none' }}
              isAnimationActive={false}
              content={({ active, payload }) => {
                const cleanPayload = payload
                  ? payload.map((item: any) => ({
                      category: item.payload[category],
                      value: item.value,
                      color: categoryColors.get(item.payload[category]) as AvailableChartColorsKeys,
                    }))
                  : [];

                return showTooltip && active ? (
                  <ChartTooltip
                    active={active}
                    payload={cleanPayload}
                    valueFormatter={(value: number) => value.toString()}
                  />
                ) : null;
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
