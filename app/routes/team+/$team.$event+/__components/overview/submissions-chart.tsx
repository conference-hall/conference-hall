import { format } from 'date-fns';
import type { TooltipProps } from 'recharts';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

import { NoData } from '~/design-system/charts/no-data.tsx';
import { Divider } from '~/design-system/divider.tsx';
import { Text } from '~/design-system/typography.tsx';

type Props = { data: Array<{ date: string; value: number }> };

const DATE_FORMAT = 'LLL dd';

export function SubmissionsChart({ data }: Props) {
  if (data.length === 0) return <NoData />;

  return (
    <ResponsiveContainer width="100%" height={256}>
      <AreaChart data={data} margin={{ bottom: 10, top: 5 }}>
        <XAxis
          xAxisId={0}
          padding={{ left: 20, right: 20 }}
          dataKey="date"
          tickLine={false}
          fontSize="12"
          stroke=""
          className="fill-gray-500"
          interval="equidistantPreserveStart"
          alignmentBaseline="baseline"
          tickFormatter={(date) => format(date, DATE_FORMAT)}
          tick={{ transform: 'translate(0, 6)' }}
          minTickGap={5}
        />
        <CartesianGrid vertical={false} className="stroke-1 stroke-gray-200" />
        <Area
          dataKey="value"
          stroke="#6366f1"
          strokeWidth={2}
          fillOpacity={0.1}
          fill="#6366f1"
          isAnimationActive={false}
        />
        <Tooltip
          isAnimationActive={false}
          position={{ y: 0 }}
          cursor={{ stroke: '#d1d5db', strokeWidth: 1 }}
          content={<CustomTooltip />}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function CustomTooltip({ payload, label }: TooltipProps<ValueType, NameType>) {
  console.log({ label });
  return (
    <div className="border border-gray-200 bg-white text-sm shadow rounded-md">
      <div className="p-2 px-3">
        <Text weight="medium">{label ? format(label, DATE_FORMAT) : 'Unknown'}</Text>
      </div>
      <Divider />
      <div className="flex flex-row items-center space-between p-2 px-3 space-x-16">
        <div className="flex items-center space-x-2">
          <span className="h-0.5 w-3 bg-blue-500" aria-hidden={true} />
          <Text variant="secondary">Proposals</Text>
        </div>
        <Text weight="medium">{payload?.[0]?.value}</Text>
      </div>
    </div>
  );
}
