import { StatusPill } from '~/design-system/charts/status-pill.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H3 } from '~/design-system/typography.tsx';

type Props = {
  totalProposals: number;
  distributionBalance: { underReviewed: number; adequatelyReviewed: number; wellReviewed: number };
};

export function ReviewCoverage({ totalProposals, distributionBalance }: Props) {
  return (
    <Card className="p-6">
      <H3>Review Coverage Analysis</H3>

      <div className="mt-6 flex flex-col gap-4 h-full">
        <div className="grow space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <StatusPill status="error" />
              <span className="text-sm text-gray-600">Needs attention (&lt;2 reviews)</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium">{distributionBalance.underReviewed}%</span>
              <span className="text-xs text-gray-500 ml-1">
                ({Math.round((distributionBalance.underReviewed / 100) * totalProposals)})
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <StatusPill status="warning" />
              <span className="text-sm text-gray-600">Adequately reviewed (2-4)</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium">{distributionBalance.adequatelyReviewed}%</span>
              <span className="text-xs text-gray-500 ml-1">
                ({Math.round((distributionBalance.adequatelyReviewed / 100) * totalProposals)})
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <StatusPill status="success" />
              <span className="text-sm text-gray-600">Well reviewed (5+)</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium">{distributionBalance.wellReviewed}%</span>
              <span className="text-xs text-gray-500 ml-1">
                ({Math.round((distributionBalance.wellReviewed / 100) * totalProposals)})
              </span>
            </div>
          </div>
        </div>

        <ReviewCoverageAnalysis totalProposals={totalProposals} distributionBalance={distributionBalance} />
      </div>
    </Card>
  );
}

function ReviewCoverageAnalysis({ distributionBalance }: Props) {
  const weightedReviewed = (distributionBalance.wellReviewed * 2 + distributionBalance.adequatelyReviewed) / 3;

  return (
    <div className="pt-5 border-t border-gray-200">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Review Quality Score</span>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-gray-900">{Math.round(weightedReviewed)}%</span>
          <span className="text-xs text-gray-500">
            {distributionBalance.wellReviewed >= 60 ? (
              <StatusPill status="success" />
            ) : distributionBalance.wellReviewed + distributionBalance.adequatelyReviewed >= 80 ? (
              <StatusPill status="warning" />
            ) : (
              <StatusPill status="error" />
            )}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-1"> Based on proposals with adequate (5+ reviews) coverage</p>
    </div>
  );
}
