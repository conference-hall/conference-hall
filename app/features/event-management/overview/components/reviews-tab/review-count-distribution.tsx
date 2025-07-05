import { useTranslation } from 'react-i18next';
import { StatusPill } from '~/shared/design-system/charts/status-pill.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { H2 } from '~/shared/design-system/typography.tsx';

type Props = {
  totalProposals: number;
  reviewCountDistribution: {
    missingReviews: number;
    underReviewed: number;
    adequatelyReviewed: number;
    wellReviewed: number;
  };
};

export function ReviewCountDistribution({ totalProposals, reviewCountDistribution }: Props) {
  const { t } = useTranslation();

  return (
    <Card className="p-6">
      <H2>{t('event-management.overview.reviews.review-count-distribution.title')}</H2>

      <div className="mt-6 flex flex-col gap-4 h-full">
        <div className="grow space-y-3">
          <DistributionLine
            status="error"
            label={t('event-management.overview.reviews.review-count-distribution.missing-reviews')}
            percentage={reviewCountDistribution.missingReviews}
            count={Math.round((reviewCountDistribution.missingReviews / 100) * totalProposals)}
          />
          <DistributionLine
            status="warning"
            label={t('event-management.overview.reviews.review-count-distribution.needs-more-reviews')}
            percentage={reviewCountDistribution.underReviewed}
            count={Math.round((reviewCountDistribution.underReviewed / 100) * totalProposals)}
          />
          <DistributionLine
            status="info"
            label={t('event-management.overview.reviews.review-count-distribution.adequately-reviewed')}
            percentage={reviewCountDistribution.adequatelyReviewed}
            count={Math.round((reviewCountDistribution.adequatelyReviewed / 100) * totalProposals)}
          />
          <DistributionLine
            status="success"
            label={t('event-management.overview.reviews.review-count-distribution.well-reviewed')}
            percentage={reviewCountDistribution.wellReviewed}
            count={Math.round((reviewCountDistribution.wellReviewed / 100) * totalProposals)}
          />
        </div>

        <ReviewCountAnalysis totalProposals={totalProposals} reviewCountDistribution={reviewCountDistribution} />
      </div>
    </Card>
  );
}

type DistributionLineProps = {
  status: 'error' | 'warning' | 'info' | 'success';
  label: string;
  percentage: number;
  count: number;
};

function DistributionLine({ status, label, percentage, count }: DistributionLineProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <StatusPill status={status} />
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className="text-right">
        <span className="text-sm font-medium">{percentage}%</span>
        <span className="text-xs text-gray-500 ml-1">({count})</span>
      </div>
    </div>
  );
}

function ReviewCountAnalysis({ reviewCountDistribution }: Props) {
  const { t } = useTranslation();

  const weightedReviewed =
    reviewCountDistribution.wellReviewed * 1.0 +
    reviewCountDistribution.adequatelyReviewed * 0.7 +
    reviewCountDistribution.underReviewed * 0.3 +
    reviewCountDistribution.missingReviews * 0.0;

  return (
    <div className="pt-5 border-t border-gray-200">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          {t('event-management.overview.reviews.quality-score.title')}
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-gray-900">{Math.round(weightedReviewed)}%</span>
          <span className="text-xs text-gray-500">
            {reviewCountDistribution.wellReviewed >= 60 ? (
              <StatusPill status="success" />
            ) : reviewCountDistribution.wellReviewed + reviewCountDistribution.adequatelyReviewed >= 80 ? (
              <StatusPill status="info" />
            ) : reviewCountDistribution.missingReviews >= 30 ? (
              <StatusPill status="error" />
            ) : (
              <StatusPill status="warning" />
            )}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-1">{t('event-management.overview.reviews.quality-score.description')}</p>
    </div>
  );
}
