import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { NoData } from '~/design-system/dashboard/no-data.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';

type Props = { proposalNotesDistribution: { averageNote: number; count: number }[] };

export function ProposalNotesDistribution({ proposalNotesDistribution }: Props) {
  const { t } = useTranslation();

  if (proposalNotesDistribution.length === 0) {
    return <NoData />;
  }

  return (
    <Card className="p-6">
      <H2>{t('event-management.overview.reviews.proposal-notes-distribution.title')}</H2>

      <div className="mt-6 space-y-4">
        <ClientOnly fallback={<div className="h-48 animate-pulse bg-gray-200 rounded" />}>
          {() => (
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={proposalNotesDistribution} margin={{ top: 16 }}>
                <XAxis
                  dataKey="averageNote"
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
                    const totalProposals = proposalNotesDistribution.reduce((sum, item) => sum + item.count, 0);
                    const percentage = totalProposals > 0 ? Math.round((Number(data.value) / totalProposals) * 100) : 0;
                    return (
                      <div className="border border-gray-200 bg-white text-sm shadow-sm rounded-md p-3">
                        <div className="font-medium">
                          {t('event-management.overview.reviews.proposal-notes-distribution.tooltip.average')}:{' '}
                          {data.payload?.averageNote}
                        </div>
                        <div className="text-gray-600">
                          {t('event-management.overview.reviews.proposal-notes-distribution.tooltip.proposals', {
                            count: data.value,
                          })}
                        </div>
                        <div className="text-gray-500 text-xs">
                          (
                          {t('event-management.overview.reviews.proposal-notes-distribution.tooltip.percentage', {
                            percentage,
                          })}
                          )
                        </div>
                      </div>
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ClientOnly>

        <div className="pt-4 border-t border-gray-200">
          <ProposalAveragesAnalysis proposalNotesDistribution={proposalNotesDistribution} />
        </div>
      </div>
    </Card>
  );
}

function ProposalAveragesAnalysis({ proposalNotesDistribution }: Props) {
  const { t } = useTranslation();

  const totalProposals = proposalNotesDistribution.reduce((sum, item) => sum + item.count, 0);
  const excellent = proposalNotesDistribution
    .filter((item) => item.averageNote >= 4.5)
    .reduce((sum, item) => sum + item.count, 0);
  const good = proposalNotesDistribution
    .filter((item) => item.averageNote >= 3 && item.averageNote < 4.5)
    .reduce((sum, item) => sum + item.count, 0);
  const average = proposalNotesDistribution
    .filter((item) => item.averageNote >= 2 && item.averageNote < 3)
    .reduce((sum, item) => sum + item.count, 0);
  const poor = proposalNotesDistribution
    .filter((item) => item.averageNote < 2)
    .reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="grid grid-cols-4 gap-4 text-center">
      <div>
        <div className="text-lg font-bold text-red-500">
          {totalProposals > 0 ? Math.round((poor / totalProposals) * 100) : 0}%
        </div>
        <Subtitle size="xs">
          {t('event-management.overview.reviews.proposal-notes-distribution.analysis.poor')}
        </Subtitle>
      </div>
      <div>
        <div className="text-lg font-bold text-orange-500">
          {totalProposals > 0 ? Math.round((average / totalProposals) * 100) : 0}%
        </div>
        <Subtitle size="xs">
          {t('event-management.overview.reviews.proposal-notes-distribution.analysis.average')}
        </Subtitle>
      </div>
      <div>
        <div className="text-lg font-bold text-blue-500">
          {totalProposals > 0 ? Math.round((good / totalProposals) * 100) : 0}%
        </div>
        <Subtitle size="xs">
          {t('event-management.overview.reviews.proposal-notes-distribution.analysis.good')}
        </Subtitle>
      </div>
      <div>
        <div className="text-lg font-bold text-green-500">
          {totalProposals > 0 ? Math.round((excellent / totalProposals) * 100) : 0}%
        </div>
        <Subtitle size="xs">
          {t('event-management.overview.reviews.proposal-notes-distribution.analysis.excellent')}
        </Subtitle>
      </div>
    </div>
  );
}
