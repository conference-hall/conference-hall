import { format } from 'date-fns';
import type { TooltipProps } from 'recharts';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

import { NoData } from '~/design-system/dashboard/no-data.tsx';
import { Divider } from '~/design-system/divider.tsx';
import { Text } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/routes/__components/utils/client-only.tsx';

type Props = { data: Array<{ date: string; count: number; cumulative: number }> };

const DATE_FORMAT = 'LLL dd';

export function CountByDayChart({ data }: Props) {
  if (data.length === 0) return <NoData />;

  return (
    <ClientOnly fallback={<ChartPlaceholder />}>
      {() => (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ bottom: 10, top: 5 }} aria-hidden="true">
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
            <Bar dataKey="count" type="linear" fill="#6366f1" maxBarSize={40} isAnimationActive={false} />
            <Tooltip
              isAnimationActive={false}
              wrapperStyle={{ outline: 'none' }}
              position={{ y: 0 }}
              cursor={{ fill: '#d1d5db', opacity: '0.15' }}
              content={<CustomTooltip />}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ClientOnly>
  );
}

function CustomTooltip({ payload, label }: TooltipProps<ValueType, NameType>) {
  return (
    <div className="border border-gray-200 bg-white text-sm shadow rounded-md" aria-hidden="true">
      <div className="p-2 px-3">
        <Text weight="medium">{label ? format(label, DATE_FORMAT) : 'Unknown'}</Text>
      </div>
      <Divider />
      <div className="flex flex-row items-center space-between p-2 px-3 space-x-16">
        <div className="flex items-center space-x-2">
          <span className="h-0.5 w-3 bg-indigo-500" aria-hidden={true} />
          <Text variant="secondary">Proposals</Text>
        </div>
        <Text weight="medium">{payload?.[0]?.value}</Text>
      </div>
    </div>
  );
}

function ChartPlaceholder() {
  return <div className="h-full min-h-60 grow animate-pulse p-4" aria-hidden="true"></div>;
}
