import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { NoData } from '~/design-system/dashboard/no-data.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H3, Subtitle } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/routes/components/utils/client-only.tsx';

type Props = { noteDistribution: { note: number; count: number }[] };

export function ReviewsDistributionChart({ noteDistribution }: Props) {
  if (noteDistribution.every((item) => item.count === 0)) {
    return <NoData />;
  }

  return (
    <Card className="p-6">
      <H3>Reviews distribution</H3>

      <div className="mt-4 space-y-4">
        <ClientOnly fallback={<div className="h-48 animate-pulse bg-gray-200 rounded" />}>
          {() => (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={noteDistribution} margin={{ top: 16 }}>
                <XAxis
                  dataKey="note"
                  tickLine={false}
                  fontSize="12"
                  stroke=""
                  className="fill-gray-500"
                  tick={{ transform: 'translate(0, 6)' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  fontSize="12"
                  stroke=""
                  className="fill-gray-500"
                  tick={{ transform: 'translate(-3, 0)' }}
                  allowDecimals={false}
                />
                <CartesianGrid vertical={false} className="stroke-1 stroke-gray-200" />
                <Bar dataKey="count" fill="#6366f1" maxBarSize={40} isAnimationActive={false} />
                <Tooltip
                  isAnimationActive={false}
                  wrapperStyle={{ outline: 'none' }}
                  cursor={{ fill: '#d1d5db', opacity: '0.15' }}
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const data = payload[0];
                    const totalScored = noteDistribution.reduce((sum, item) => sum + item.count, 0);
                    const percentage = totalScored > 0 ? Math.round((Number(data.value) / totalScored) * 100) : 0;
                    return (
                      <div className="border border-gray-200 bg-white text-sm shadow-sm rounded-md p-3">
                        <div className="font-medium">Score: {data.payload?.note}/5</div>
                        <div className="text-gray-600">Count: {data.value}</div>
                        <div className="text-gray-500 text-xs">({percentage}% of all scores)</div>
                      </div>
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ClientOnly>

        <div className="pt-4 border-t border-gray-200">
          <NoteDistributionAnalysis noteDistribution={noteDistribution} />
        </div>
      </div>
    </Card>
  );
}

function NoteDistributionAnalysis({ noteDistribution }: Props) {
  const totalScored = noteDistribution.reduce((sum, item) => sum + item.count, 0);
  const excellent = noteDistribution.filter((item) => item.note === 5).reduce((sum, item) => sum + item.count, 0);
  const good = noteDistribution.filter((item) => item.note === 4).reduce((sum, item) => sum + item.count, 0);
  const average = noteDistribution.filter((item) => item.note === 3).reduce((sum, item) => sum + item.count, 0);
  const poor = noteDistribution.filter((item) => item.note <= 2).reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="grid grid-cols-3 gap-4 text-center">
      <div>
        <div className="text-lg font-bold text-red-500">
          {totalScored > 0 ? Math.round((poor / totalScored) * 100) : 0}%
        </div>
        <Subtitle size="xs">Lowest (0-2)</Subtitle>
      </div>
      <div>
        <div className="text-lg font-bold text-orange-500">
          {totalScored > 0 ? Math.round((average / totalScored) * 100) : 0}%
        </div>
        <Subtitle size="xs">Average (3)</Subtitle>
      </div>
      <div>
        <div className="text-lg font-bold text-green-500">
          {totalScored > 0 ? Math.round(((excellent + good) / totalScored) * 100) : 0}%
        </div>
        <Subtitle size="xs">Highest (4-5)</Subtitle>
      </div>
    </div>
  );
}
