import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TooltipContentProps } from 'recharts';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent.js';
import { NoData } from '~/design-system/dashboard/no-data.tsx';
import { Divider } from '~/design-system/divider.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Text } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';
import { formatDay } from '~/shared/datetimes/datetimes.ts';

type ChartType = 'cumulative' | 'count';

type ChartData = Array<{ date: Date; count: number; cumulative: number }>;

type ProposalsByDayChartProps = { data: ChartData; className?: string };

export function ProposalsByDayChart({ data, className }: ProposalsByDayChartProps) {
  const { t } = useTranslation();
  const [type, setType] = useState<ChartType>('cumulative');

  if (data.length === 0) return <NoData />;

  return (
    <Card className={className}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <H2>{t('event-management.overview.submissions-by-day.heading')}</H2>
        <ChartSelector selected={type} onSelect={setType} />
      </div>

      <ClientOnly fallback={<ChartPlaceholder />}>
        {() => (type === 'cumulative' ? <CumulativeByDayChart data={data} /> : <CountByDayChart data={data} />)}
      </ClientOnly>
    </Card>
  );
}

function CumulativeByDayChart({ data }: { data: ChartData }) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ bottom: 10, top: 10 }} aria-hidden="true">
        <YAxis
          type="number"
          width={40}
          axisLine={false}
          tickLine={false}
          fontSize="12"
          stroke=""
          className="fill-gray-500"
          tick={{ transform: 'translate(-3, 0)' }}
          allowDecimals={false}
        />
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
          tickFormatter={(date) => formatDay(date, { format: 'medium', locale })}
          tick={{ transform: 'translate(0, 6)' }}
          minTickGap={5}
        />
        <CartesianGrid vertical={false} className="stroke-1 stroke-gray-200" />
        <Area
          dataKey="cumulative"
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
          content={CustomTooltip}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function CountByDayChart({ data }: { data: ChartData }) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ bottom: 10, top: 10 }} aria-hidden="true">
        <YAxis
          type="number"
          width={40}
          axisLine={false}
          tickLine={false}
          fontSize="12"
          stroke=""
          className="fill-gray-500"
          tick={{ transform: 'translate(-3, 0)' }}
          allowDecimals={false}
        />
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
          tickFormatter={(date) => formatDay(date, { format: 'medium', locale })}
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
          content={CustomTooltip}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function CustomTooltip({ payload }: TooltipContentProps<ValueType, NameType>) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const date = payload?.[0]?.payload?.date;

  return (
    <div className="rounded-md border border-gray-200 bg-white text-sm shadow-sm" aria-hidden="true">
      <div className="p-2 px-3">
        <Text weight="medium">{date ? formatDay(date, { format: 'long', locale }) : t('common.unknown')}</Text>
      </div>
      <Divider />
      <div className="space-between flex flex-row items-center space-x-16 p-2 px-3">
        <div className="flex items-center space-x-2">
          <span className="h-0.5 w-3 bg-indigo-500" aria-hidden={true} />
          <Text variant="secondary">{t('common.proposals')}</Text>
        </div>
        <Text weight="medium">{payload?.[0]?.value}</Text>
      </div>
    </div>
  );
}

function ChartPlaceholder() {
  return <div className="h-full min-h-60 grow animate-pulse p-4" aria-hidden="true" />;
}

type ChartSelectorProps = { selected: ChartType; onSelect: (value: ChartType) => void };

function ChartSelector({ selected, onSelect }: ChartSelectorProps) {
  const { t } = useTranslation();
  return (
    <div className="flex w-fit gap-1 rounded-lg bg-slate-100 p-1 ring-1 ring-gray-200 ring-inset">
      <button
        type="button"
        onClick={() => onSelect('count')}
        className={cx(
          'flex cursor-pointer items-center rounded-md px-3 py-1 font-semibold text-sm outline-hidden focus-within:ring-2 focus-within:ring-indigo-500',
          { 'bg-white shadow-sm': selected === 'count' },
        )}
      >
        {t('event-management.overview.submissions-by-day.count')}
      </button>
      <button
        type="button"
        onClick={() => onSelect('cumulative')}
        className={cx(
          'flex cursor-pointer items-center rounded-md px-3 py-1 font-semibold text-sm outline-hidden focus-within:ring-2 focus-within:ring-indigo-500',
          { 'bg-white shadow-sm': selected === 'cumulative' },
        )}
      >
        {t('event-management.overview.submissions-by-day.cumulative')}
      </button>
    </div>
  );
}
