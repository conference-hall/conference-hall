import { HeartIcon } from '@heroicons/react/20/solid';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ReviewsMetrics } from '~/.server/event-metrics/reviews-metrics.ts';
import { StatusPill } from '~/design-system/charts/status-pill.tsx';
import { NoData } from '~/design-system/dashboard/no-data.tsx';
import { ProgressCard } from '~/design-system/dashboard/progress-card.tsx';
import { StatisticCard } from '~/design-system/dashboard/statistic-card.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H3 } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { ClientOnly } from '~/routes/components/utils/client-only.tsx';
import type { Route } from './+types/reviews-tab.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);

  const metrics = await ReviewsMetrics.for(userId, params.team, params.event).get();
  return { metrics };
};

export default function ReviewsTabRoute({ loaderData: { metrics } }: Route.ComponentProps) {
  return (
    <div className="px-6 space-y-8">
      <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-4">
        <StatisticCard label="Average Score" stat={metrics.averageNote > 0 ? metrics.averageNote.toFixed(1) : '-'} />
        <StatisticCard label="Median Score" stat={metrics.medianNote > 0 ? metrics.medianNote.toFixed(1) : '-'} />
        <StatisticCard
          label="Favorites count"
          stat={
            <div className="flex items-center space-x-2">
              <span>{metrics.positiveReviews}</span>
              <HeartIcon className="h-8 w-8 text-red-400" aria-hidden="true" />
            </div>
          }
        />
        <ProgressCard label="Proposals reviewed" value={metrics.reviewedProposals} max={metrics.totalProposals} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-2">
        {metrics.noteDistribution.some((item) => item.count > 0) ? (
          <Card className="p-6">
            <H3>Reviews distribution</H3>
            <div className="mt-4 space-y-4">
              <ClientOnly fallback={<div className="h-48 animate-pulse bg-gray-200 rounded" />}>
                {() => (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={metrics.noteDistribution} margin={{ top: 16 }}>
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
                          const totalScored = metrics.noteDistribution.reduce((sum, item) => sum + item.count, 0);
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

              <div className="pt-3 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {(() => {
                    const totalScored = metrics.noteDistribution.reduce((sum, item) => sum + item.count, 0);
                    const excellent = metrics.noteDistribution
                      .filter((item) => item.note === 5)
                      .reduce((sum, item) => sum + item.count, 0);
                    const good = metrics.noteDistribution
                      .filter((item) => item.note === 4)
                      .reduce((sum, item) => sum + item.count, 0);
                    const average = metrics.noteDistribution
                      .filter((item) => item.note === 3)
                      .reduce((sum, item) => sum + item.count, 0);
                    const poor = metrics.noteDistribution
                      .filter((item) => item.note <= 2)
                      .reduce((sum, item) => sum + item.count, 0);

                    return (
                      <>
                        <div>
                          <div className="text-lg font-bold text-red-600">
                            {totalScored > 0 ? Math.round((poor / totalScored) * 100) : 0}%
                          </div>
                          <div className="text-xs text-gray-500">Lowest (0-2)</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-yellow-600">
                            {totalScored > 0 ? Math.round((average / totalScored) * 100) : 0}%
                          </div>
                          <div className="text-xs text-gray-500">Average (3)</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">
                            {totalScored > 0 ? Math.round(((excellent + good) / totalScored) * 100) : 0}%
                          </div>
                          <div className="text-xs text-gray-500">Highest (4-5)</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <NoData />
        )}

        <Card className="p-6">
          <H3>Review Coverage Analysis</H3>

          <div className="mt-4 space-y-4">
            {metrics.distributionBalance.underReviewed > 0 && (
              <div className="rounded-md bg-amber-50 p-3 border border-amber-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-4 w-4 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      role="img"
                      aria-label="Alert"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-2">
                    <p className="text-sm text-amber-800">
                      <span className="font-medium">
                        {Math.round((metrics.distributionBalance.underReviewed / 100) * metrics.totalProposals)}
                      </span>{' '}
                      proposals need more reviews
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <StatusPill status="error" />
                  <span className="text-sm text-gray-600">Needs attention (&lt;2 reviews)</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">{metrics.distributionBalance.underReviewed}%</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({Math.round((metrics.distributionBalance.underReviewed / 100) * metrics.totalProposals)})
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <StatusPill status="warning" />
                  <span className="text-sm text-gray-600">Adequately reviewed (2-4)</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">{metrics.distributionBalance.adequatelyReviewed}%</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({Math.round((metrics.distributionBalance.adequatelyReviewed / 100) * metrics.totalProposals)})
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <StatusPill status="success" />
                  <span className="text-sm text-gray-600">Well reviewed (5+)</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">{metrics.distributionBalance.wellReviewed}%</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({Math.round((metrics.distributionBalance.wellReviewed / 100) * metrics.totalProposals)})
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Review Quality Score</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-900">
                    {Math.round(
                      ((metrics.distributionBalance.wellReviewed * 2 +
                        metrics.distributionBalance.adequatelyReviewed * 1) /
                        100) *
                        100,
                    )}
                    %
                  </span>
                  <span className="text-xs text-gray-500">
                    {metrics.distributionBalance.wellReviewed >= 60 ? (
                      <StatusPill status="success" />
                    ) : metrics.distributionBalance.wellReviewed + metrics.distributionBalance.adequatelyReviewed >=
                      80 ? (
                      <StatusPill status="warning" />
                    ) : (
                      <StatusPill status="error" />
                    )}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Based on proposals with adequate (5+ reviews) coverage</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
