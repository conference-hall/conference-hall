import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { NoData } from '~/design-system/dashboard/no-data.tsx';
import { ProgressCard } from '~/design-system/dashboard/progress-card.tsx';
import { StatisticCard } from '~/design-system/dashboard/statistic-card.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H3 } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/routes/components/utils/client-only.tsx';

type ReviewsMetrics = {
  totalProposals: number;
  reviewedProposals: number;
  completionRate: number;
  distributionBalance: {
    underReviewed: number;
    adequatelyReviewed: number;
    wellReviewed: number;
  };
  averageNote: number;
  medianNote: number;
  positiveReviews: number;
  noteDistribution: Array<{ note: number; count: number }>;
};

type ReviewsMetricsProps = {
  metrics: ReviewsMetrics;
};

export function ReviewsMetrics({ metrics }: ReviewsMetricsProps) {
  return (
    <div className="space-y-8">
      {/* Top Row - Progress and Score Metrics */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-4">
        <StatisticCard label="Average Score" stat={metrics.averageNote > 0 ? metrics.averageNote.toFixed(1) : '-'} />
        <StatisticCard label="Median Score" stat={metrics.medianNote > 0 ? metrics.medianNote.toFixed(1) : '-'} />
        <ProgressCard label="Review Completion" value={metrics.reviewedProposals} max={metrics.totalProposals} />
        <StatisticCard
          label="Positive Reviews"
          stat={
            <div className="flex items-center space-x-2">
              <span>{metrics.positiveReviews}</span>
              <svg
                className="h-8 w-8 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                role="img"
                aria-label="Heart"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          }
        />
      </div>

      {/* Bottom Row - Score Quality and Review Coverage */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-2">
        {metrics.noteDistribution.some((item) => item.count > 0) ? (
          <Card className="p-6">
            <H3>Score Quality Analysis</H3>
            <div className="mt-4 space-y-4">
              {/* Quality insights */}
              <div className="space-y-2">
                {(() => {
                  const totalScored = metrics.noteDistribution.reduce((sum, item) => sum + item.count, 0);
                  const highQuality = metrics.noteDistribution
                    .filter((item) => item.note >= 4)
                    .reduce((sum, item) => sum + item.count, 0);
                  const lowQuality = metrics.noteDistribution
                    .filter((item) => item.note <= 2)
                    .reduce((sum, item) => sum + item.count, 0);
                  const highQualityPercentage = totalScored > 0 ? Math.round((highQuality / totalScored) * 100) : 0;
                  const lowQualityPercentage = totalScored > 0 ? Math.round((lowQuality / totalScored) * 100) : 0;

                  return (
                    <>
                      {/* High quality alert */}
                      {highQualityPercentage >= 60 && (
                        <div className="rounded-md bg-green-50 p-3 border border-green-200">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <svg
                                className="h-4 w-4 text-green-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                role="img"
                                aria-label="Success"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div className="ml-2">
                              <p className="text-sm text-green-800">
                                <span className="font-medium">{highQualityPercentage}%</span> of reviews are high
                                quality (4-5 stars)
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Low quality alert */}
                      {lowQualityPercentage >= 30 && (
                        <div className="rounded-md bg-red-50 p-3 border border-red-200">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <svg
                                className="h-4 w-4 text-red-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                role="img"
                                aria-label="Warning"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div className="ml-2">
                              <p className="text-sm text-red-800">
                                <span className="font-medium">{lowQualityPercentage}%</span> of reviews are concerning
                                (0-2 stars)
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Chart */}
              <div>
                <ClientOnly fallback={<div className="h-48 animate-pulse bg-gray-200 rounded" />}>
                  {() => (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={metrics.noteDistribution} margin={{ bottom: 10, top: 10 }}>
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
                            const percentage =
                              totalScored > 0 ? Math.round((Number(data.value) / totalScored) * 100) : 0;
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
              </div>

              {/* Score breakdown summary */}
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
                          <div className="text-xs text-gray-500">Needs work (0-2)</div>
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
                          <div className="text-xs text-gray-500">Positive (4-5)</div>
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
            {/* Alert for under-reviewed proposals */}
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

            {/* Distribution breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
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
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
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
                  <div className="w-3 h-3 rounded-full bg-green-400" />
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

            {/* Review quality indicator */}
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
                    {metrics.distributionBalance.wellReviewed >= 60
                      ? '🟢'
                      : metrics.distributionBalance.wellReviewed + metrics.distributionBalance.adequatelyReviewed >= 80
                        ? '🟡'
                        : '🔴'}
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
